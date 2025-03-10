import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req, res) {
  const { method } = req

  if (method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { inventoryId, rollNumber, quantity = 1 } = req.body

  try {
    // Validate required fields
    if (!inventoryId || !rollNumber) {
      return res.status(400).json({
        message: 'Inventory ID and Roll Number are required'
      })
    }

    // Validate roll number format (optional)
    if (!/^.{1,20}$/.test(rollNumber.trim())) {
      return res.status(400).json({
        message: 'Invalid roll number format. It should be 1-20 characters.'
      })
    }

    // Fetch inventory item
    const inventoryItem = await prisma.inventory.findUnique({
      where: { id: inventoryId }
    })

    // Check item availability
    if (!inventoryItem) {
      return res.status(404).json({ message: 'Item not found' })
    }

    // Check quantity constraints
    if (inventoryItem.quantity === 0 ||
      (inventoryItem.quantity !== -1 && inventoryItem.quantity < quantity)) {
      return res.status(400).json({
        message: 'Insufficient quantity available'
      })
    }

    // Create issue
    const issue = await prisma.issue.create({
      data: {
        inventoryId,
        rollNumber: rollNumber.toLowerCase(), // Normalize roll number
        quantity,
        daysToReturn: inventoryItem.returnable ? 7 : 0,
        returned: false
      }
    })

    // Update inventory quantity if not unlimited
    if (inventoryItem.quantity !== -1) {
      await prisma.inventory.update({
        where: { id: inventoryId },
        data: {
          quantity: inventoryItem.quantity - quantity,
          available: inventoryItem.quantity - quantity > 0
        }
      })
    }

    return res.status(201).json(issue)
  } catch (error) {
    console.error('Error creating issue:', error)
    return res.status(500).json({
      message: 'Failed to create issue',
      error: error.message
    })
  } finally {
    await prisma.$disconnect()
  }
}