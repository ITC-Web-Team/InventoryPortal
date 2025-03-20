export const isAdmin = (userDataOrRequest) => {
  // If it's a request object (server-side)
  if (userDataOrRequest?.cookies) {
    const isAdminCookie = userDataOrRequest.cookies.get('isAdmin')?.value
    return isAdminCookie === 'true'
  }

  // If it's user data (client-side)
  if (!userDataOrRequest) return false

  return (
    userDataOrRequest.roles?.includes('admin') ||
    userDataOrRequest.isAdmin === true ||
    userDataOrRequest.department === 'ITC'
  )
}

export const isGuest = (userData) => {
  return userData?.roll === 'guest'
}

export const isAuthenticated = () => {
  if (typeof window === 'undefined') return false
  const userData = localStorage.getItem('userdata')
  return !!userData
}

export const getUserData = () => {
  if (typeof window === 'undefined') return null
  const userData = localStorage.getItem('userdata')
  return userData ? JSON.parse(userData) : null
}

export const setUserData = (data) => {
  if (typeof window === 'undefined') return
  localStorage.setItem('userdata', JSON.stringify(data))
}

export const clearUserData = () => {
  if (typeof window === 'undefined') return
  localStorage.removeItem('userdata')
  document.cookie = 'isAdmin=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
}

export const setAdminStatus = () => {
  if (typeof window === 'undefined') return
  localStorage.setItem('isAdmin', 'true')
  document.cookie = 'isAdmin=true; path=/'
}

export const clearAdminStatus = () => {
  if (typeof window === 'undefined') return
  localStorage.removeItem('isAdmin')
  document.cookie = 'isAdmin=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
}

export const requireAuth = (router) => {
  if (!isAuthenticated()) {
    router.push('/')
    return false
  }
  return true
}

export const requireAdmin = (router) => {
  const userData = getUserData()
  if (!isAdmin(userData)) {
    router.push('/inventory')
    return false
  }
  return true
}

export const requireNonGuest = (router) => {
  const userData = getUserData()
  if (isGuest(userData)) {
    router.push('/inventory')
    return false
  }
  return true
} 