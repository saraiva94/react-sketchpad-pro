
import { useState } from 'react'
import { useAuthContext } from '../../contexts/AuthContext'

interface UserNavProps {
  onNavigate: (path: string) => void
}

export function UserNav({ onNavigate }: UserNavProps) {
  const { user, signOut } = useAuthContext()
  const [showDropdown, setShowDropdown] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    setShowDropdown(false)
    // Redirecionar para home após logout
    onNavigate('/')
  }

  const getUserInitials = () => {
    if (user?.profile?.full_name) {
      return user.profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
    }
    return user?.email?.[0].toUpperCase() || 'U'
  }

  const getUserType = () => {
    if (user?.email === 'portobellofilmes@gmail.com') return 'Admin'
    if (user?.profile?.user_type === 'producer') return 'Produtor'
    if (user?.profile?.user_type === 'investor') return 'Investidor'
    return 'Usuário'
  }

  const getUserName = () => {
    if (user?.profile?.full_name) {
      const firstName = user.profile.full_name.split(' ')[0]
      return firstName
    }
    return user?.email?.split('@')[0] || 'Usuário'
  }

  if (!user) {
    return (
      <button 
        onClick={() => onNavigate('/auth')}
        className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
      >
        Entrar na Plataforma
      </button>
    )
  }

  return (
    <div className="relative">
      <div className="flex items-center space-x-4">
        {/* User Info */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-semibold">
              {getUserInitials()}
            </span>
          </div>
          <div className="hidden md:block text-sm">
            <p className="font-medium text-gray-800">
              {getUserName()}
            </p>
            <p className="text-xs text-gray-500">
              {getUserType()}
            </p>
          </div>
        </div>

        {/* Dashboard Button */}
        <button 
          onClick={() => onNavigate('/dashboard')}
          className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap text-sm"
        >
          Dashboard
        </button>

        {/* Dropdown Menu */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-800 cursor-pointer"
          >
            <i className="ri-more-2-line"></i>
          </button>

          {showDropdown && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowDropdown(false)}
              ></div>
              
              {/* Dropdown */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                <div className="py-2">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="font-medium text-gray-800 text-sm">{getUserName()}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                    <p className="text-xs text-blue-600 font-medium">{getUserType()}</p>
                  </div>
                  
                  <button
                    onClick={() => {
                      setShowDropdown(false)
                      onNavigate('/dashboard')
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer flex items-center"
                  >
                    <i className="ri-dashboard-line mr-2"></i>
                    Dashboard
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowDropdown(false)
                      onNavigate('/messages')
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer flex items-center"
                  >
                    <i className="ri-message-3-line mr-2"></i>
                    Mensagens
                  </button>

                  {user.email === 'portobellofilmes@gmail.com' && (
                    <button
                      onClick={() => {
                        setShowDropdown(false)
                        onNavigate('/projects/create')
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer flex items-center"
                    >
                      <i className="ri-add-circle-line mr-2"></i>
                      Criar Projeto
                    </button>
                  )}
                  
                  <div className="border-t border-gray-100 mt-2 pt-2">
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer flex items-center"
                    >
                      <i className="ri-logout-box-line mr-2"></i>
                      Sair
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
