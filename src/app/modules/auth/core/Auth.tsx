/* eslint-disable react-refresh/only-export-components */
import { FC, useState, useEffect, createContext, useContext, Dispatch, SetStateAction } from 'react'
import { LayoutSplashScreen } from '../../../../_metronic/layout/core'
import { AuthModel, UserModel } from './_models'
import * as authHelper from './AuthHelpers'
import { getUserByToken, logout as logoutRequest } from './_requests'
import { WithChildren } from '../../../../_metronic/helpers'

type AuthContextProps = {
  auth: AuthModel | undefined
  saveAuth: (auth: AuthModel | undefined) => void
  currentUser: UserModel | undefined
  setCurrentUser: Dispatch<SetStateAction<UserModel | undefined>>
  logout: () => Promise<void>
}

const initAuthContextPropsState = {
  auth: authHelper.getAuth(),
  saveAuth: () => { },
  currentUser: undefined,
  setCurrentUser: () => { },
  logout: async () => { },
}

const AuthContext = createContext<AuthContextProps>(initAuthContextPropsState)

const useAuth = () => {
  return useContext(AuthContext)
}

const USER_CACHE_KEY = 'cached_user_profile';

const AuthProvider: FC<WithChildren> = ({ children }) => {
  const [auth, setAuth] = useState<AuthModel | undefined>(authHelper.getAuth())
  const [currentUser, setCurrentUser] = useState<UserModel | undefined>(() => {
    // Khôi phục user từ cache để tránh flash loading khi F5
    try {
      const cached = sessionStorage.getItem(USER_CACHE_KEY);
      return cached ? JSON.parse(cached) : undefined;
    } catch {
      return undefined;
    }
  })

  const saveAuth = (auth: AuthModel | undefined) => {
    setAuth(auth)
    if (auth) {
      authHelper.setAuth(auth)
    } else {
      authHelper.removeAuth()
    }
  }

  const logout = async () => {
    try {
      if (authHelper.getAuth()?.token) {
        await logoutRequest()
      }
    } catch (error) {
      console.error(error)
    }
    saveAuth(undefined)
    setCurrentUser(undefined)
    sessionStorage.removeItem(USER_CACHE_KEY);
  }

  return (
    <AuthContext.Provider value={{ auth, saveAuth, currentUser, setCurrentUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

const AuthInit: FC<WithChildren> = ({ children }) => {
  const { auth, currentUser, logout, setCurrentUser } = useAuth()
  const [showSplashScreen, setShowSplashScreen] = useState(true)

  useEffect(() => {
    let mounted = true;

    const requestUser = async () => {
      try {
        if (!currentUser) {
          const { data } = await getUserByToken()
          if (mounted && data) {
            setCurrentUser(data)
            // Cache user để lần F5 sau không cần gọi API
            try {
              sessionStorage.setItem(USER_CACHE_KEY, JSON.stringify(data));
            } catch {}
          }
        }
      } catch (error) {
        console.error(error)
        if (mounted) {
          await logout()
        }
      }
    }

    if (auth && auth.token) {
      setShowSplashScreen(false)
      // Chỉ gọi API lấy user nếu chưa có cache
      if (!currentUser) {
        requestUser()
      }
    } else {
      logout()
      setShowSplashScreen(false)
    }

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line
  }, [])

  return showSplashScreen ? <LayoutSplashScreen /> : <>{children}</>
}

export { AuthProvider, AuthInit, useAuth }