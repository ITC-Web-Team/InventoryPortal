'use client'

// components/Profile.js
import { useEffect, useState } from 'react';
import axios from 'axios';
import { LogOut, Package, Clock, ArrowLeft, Check, X, User, Mail, Building, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { getUserData, clearUserData, isGuest, requireAuth } from '../../utils/auth';

export default function ProfilePage() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const fetchUserIssues = async (roll) => {
    try {
      if (!roll) {
        console.error('No user roll number found')
        return
      }

      const response = await axios.get(`/api/issues/user?roll=${roll}`)
      setIssues(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching issues:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    setMounted(true)
    if (!requireAuth(router)) return

    const userData = getUserData()
    if (userData) {
      setUserData(userData)
      if (!isGuest(userData)) {
        fetchUserIssues(userData.roll)
      } else {
        setLoading(false)
      }
    }
  }, [router])

  useEffect(() => {
    if (userData?.isAdmin) {
      router.push('/inventory');
    }
  }, [userData]);

  const handleLogout = () => {
    clearUserData()
    router.push('/')
  }

  const handleReturn = async (issueId) => {
    try {
      const response = await axios.post('/api/issues/return', { issueId });

      if (response.data) {
        await fetchUserIssues(userData.roll);
        alert('Item returned successfully!');
      }
    } catch (error) {
      console.error('Error returning item:', error);
      alert(error.response?.data?.message || 'Failed to return item');
    }
  };

  // Prevent hydration errors by not rendering until mounted
  if (!mounted) return null;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin w-10 h-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={() => router.push('/inventory')}
          className="btn-outline flex items-center"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Inventory
        </button>

        <button
          className="btn-danger flex items-center"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 mr-2" />
          Logout
        </button>
      </div>

      {/* Profile Info */}
      <div className="grid md:grid-cols-3 gap-8">
        {/* User Details Card */}
        <div className="card p-6">
          {/* Profile Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-blue-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {userData?.name || 'User'}
              </h2>
              <p className="text-gray-500">
                {isGuest(userData) ? 'Guest User' : userData?.roll || 'No Roll Number'}
              </p>
            </div>
          </div>

          {/* User Details List */}
          <div className="space-y-4">
            {/* Email - Only show for non-guest users */}
            {!isGuest(userData) && (
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Email</p>
                  <p className="text-gray-800">{userData?.roll || 'N/A'}@iitb.ac.in</p>
                </div>
              </div>
            )}

            {/* Department */}
            <div className="flex items-start gap-3">
              <Building className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-600">Department</p>
                <p className="text-gray-800">{userData?.department || 'N/A'}</p>
              </div>
            </div>

            {/* Course Details - Only show for non-guest users */}
            {!isGuest(userData) && (
              <div className="flex items-start gap-3">
                <GraduationCap className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Program</p>
                  <p className="text-gray-800">
                    {userData?.degree || 'N/A'}
                  </p>
                </div>
              </div>
            )}

            {/* Last Login */}
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-600">Last Login</p>
                <p className="text-gray-800">
                  {new Date(userData?.lastLogin).toLocaleString() || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Issues Summary - Only show for non-guest users */}
        {!isGuest(userData) && (
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Issued Items</h3>

            {issues.length === 0 ? (
              <div className="card p-6 text-center text-gray-500">
                No items currently issued
              </div>
            ) : (
              <div className="space-y-4">
                {issues.map((issue) => (
                  <div
                    key={issue.id}
                    className="card p-4 flex flex-col md:flex-row justify-between md:items-center gap-4"
                  >
                    <div className="flex-grow">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-800">
                          {issue.itemName}
                        </h4>
                        <span className={`
                          px-2 py-1 rounded-full text-xs flex items-center gap-1
                          ${issue.returned ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                        `}>
                          {issue.returned ? (
                            <>
                              <Check className="w-3 h-3" />
                              Returned
                            </>
                          ) : (
                            <>
                              <X className="w-3 h-3" />
                              Pending
                            </>
                          )}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Package className="w-4 h-4 mr-1" />
                          Quantity: {issue.quantity}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          Issued: {new Date(issue.issueDate).toLocaleDateString()}
                        </div>
                        {issue.daysToReturn > 0 && !issue.returned && (
                          <div className="text-yellow-600">
                            Return within {issue.daysToReturn} days
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
