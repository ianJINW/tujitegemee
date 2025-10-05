import React, { useEffect, useState } from 'react'
import { LoginUser, LogoutUser, usePostInfo } from '../api/api'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeClosed, XCircle, User2Icon } from 'lucide-react'
import useAdminStore from '../stores/admin.stores'
import { Link } from 'react-router-dom'

const LoginURL = import.meta.env.VITE_APP_LOGINURL
const LogoutURL = import.meta.env.VITE_APP_LOGOUTURL
const RegisterURL = import.meta.env.VITE_APP_LREGISTERURL

const Login: React.FC = () => {
  const [data, setData] = useState({ email: '', password: '' })
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const navigate = useNavigate()
  const isAuthenticated = useAdminStore(state => !!state.isAuthenticated)
  const { mutate, isPending, isError, error, reset } = LoginUser(LoginURL)
  const [showPassword, setShowPassword] = useState(false)

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev)
  }

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/')
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    if (isError) {
      let message = 'An unknown error occurred. Please try again.'
      if (error instanceof Error) {
        message = error.message
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        message = (error as { message: string }).message
      }
      setErrorMsg(message)
    }
  }, [isError, error])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMsg(null)
    reset()

    const formData = {
      username: data.email,
      email: data.email,
      password: data.password
    }

    mutate(formData, {
      onSuccess: data => {
        // Success handled by auth store
        console.log('Login successful:', data)
      },
      onError: (err: unknown) => {
        let message = 'Login failed. Please check your credentials.'
        if (err && typeof err === 'string') {
          message = err as string
        } else if (err instanceof Error) {
          message = err.message
        }
        setErrorMsg(message)
      }
    })
  }

  const handleDismissError = () => setErrorMsg(null)

  return (
    <div className='flex justify-center items-center min-h-screen bg-surface-2'>
      <fieldset className='w-full max-w-md border border-surface-3 rounded-lg p-6 bg-surface-1 shadow-lg'>
        <legend>
          <h1>Login</h1>
        </legend>
        {errorMsg && (
          <div className="flex items-center bg-error/10 border border-error text-error px-4 py-3 rounded relative mb-4" role="alert">
            <XCircle className="mr-2" size={20} />
            <span className="block flex-1">{errorMsg}</span>
            <button
              onClick={handleDismissError}
              className="ml-2 text-red-700 hover:text-red-900 focus:outline-none"
              aria-label="Dismiss error"
              type="button"
            >
              ×
            </button>
          </div>
        )}
        <form onSubmit={handleSubmit} className='flex flex-col m-1 p-1 text-black gap-2'>
          <label className='flex items-center gap-2'>
            <Mail size={20} />
            Email
          </label>
          <input
            placeholder='Please input your email'
            type='email'
            className={`input-base ${errorMsg ? 'border-red-400' : ''}`}
            value={data.email}
            onChange={e => setData({ ...data, email: e.target.value })}
            autoComplete="username"
            required
          />

          <label className='flex items-center gap-2 mt-4'>
            <Lock size={20} />
            Password
          </label>
          <div className='relative'>
            <input
              placeholder='Please input your password'
              type={showPassword ? 'text' : 'password'}
              className={`input-base ${errorMsg ? 'border-red-400' : ''}`}
              value={data.password}
              onChange={e => setData({ ...data, password: e.target.value })}
              autoComplete="current-password"
              required
            />
            {showPassword === false ? (
              <span className='absolute right-2 top-3 text-gray-600 cursor-pointer'>
                <Eye size={20} onClick={togglePasswordVisibility} />
              </span>
            ) : (
              <span className='absolute right-2 top-3 text-gray-600 cursor-pointer'>
                <EyeClosed size={20} onClick={togglePasswordVisibility} />
              </span>
            )}
          </div>

          <button className={`btn btn-primary ${isPending ? 'opacity-70 cursor-not-allowed' : ''}`} type='submit' disabled={isPending}>
            {isPending ? `Logging in ...` : 'Login'}
          </button>
        </form>
        <Nav />
      </fieldset>
    </div>
  )
}

const Nav: React.FC = () => {
  const admin = useAdminStore(state => state.admin)
  return (
    <nav>
      {admin && <>

        <Link to='/register'> Register</Link>
        <Link to='/logout'> Logout</Link></>
      }</nav>
  )
}

export const Register: React.FC = () => {
  const [data, setData] = useState({ email: '', password: '', username: '' })
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const navigate = useNavigate()
  const isAuthenticated = useAdminStore(state => !!state.isAuthenticated)
  const { mutate, isPending, isError, error, reset } = usePostInfo(RegisterURL)
  const [showPassword, setShowPassword] = useState(false)

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev)
  }

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/')
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    if (isError) {
      let message = 'An unknown error occurred. Please try again.'
      if (error instanceof Error) {
        message = error.message
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        message = (error as { message: string }).message
      }
      setErrorMsg(message)
    }
  }, [isError, error])

  const handleDismissError = () => setErrorMsg(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMsg(null)
    reset()

    const formData = {
      username: data.username,
      email: data.email,
      password: data.password
    }

    mutate(formData)
  }

  return (
    <>
      {errorMsg && (
        <div className="flex items-center bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <XCircle className="mr-2" size={20} />
          <span className="block flex-1">{errorMsg}</span>
          <button
            onClick={handleDismissError}
            className="ml-2 text-red-700 hover:text-red-900 focus:outline-none"
            aria-label="Dismiss error"
            type="button"
          >
            ×
          </button>
        </div>
      )}
      <fieldset>
        <legend>Add an admin</legend>
        <form onSubmit={handleSubmit} className='flex flex-col m-1 p-1 text-black gap-2'>

          <label className='flex items-center gap-2'>
            <User2Icon size={20} />
            Username
          </label>
          <input
            placeholder='Please input your email'
            type='email'
            className={`input-base ${errorMsg ? 'border-red-400' : ''}`}
            value={data.username}
            onChange={e => setData({ ...data, username: e.target.value })}
            autoComplete="username"
            required
          />

          <label className='flex items-center gap-2'>
            <Mail size={20} />
            Email
          </label>
          <input
            placeholder='Please input your email'
            type='email'
            className={`input-base ${errorMsg ? 'border-red-400' : ''}`}
            value={data.email}
            onChange={e => setData({ ...data, email: e.target.value })}
            autoComplete="username"
            required
          />

          <label className='flex items-center gap-2 mt-4'>
            <Lock size={20} />
            Password
          </label>
          <div className='relative'>
            <input
              placeholder='Please input your password'
              type={showPassword ? 'text' : 'password'}
              className={`input-base ${errorMsg ? 'border-red-400' : ''}`}
              value={data.password}
              onChange={e => setData({ ...data, password: e.target.value })}
              autoComplete="current-password"
              required
            />
            {showPassword === false ? (
              <span className='absolute right-2 top-3 text-gray-600 cursor-pointer'>
                <Eye size={20} onClick={togglePasswordVisibility} />
              </span>
            ) : (
              <span className='absolute right-2 top-3 text-gray-600 cursor-pointer'>
                <EyeClosed size={20} onClick={togglePasswordVisibility} />
              </span>
            )}
          </div>

          <button className={`btn btn-primary ${isPending ? 'opacity-70 cursor-not-allowed' : ''}`} type='submit' disabled={isPending}>
            {isPending ? `Logging in ...` : 'Login'}
          </button>
        </form>
        <Nav />
      </fieldset>
    </>
  )
}

export const Logout: React.FC = () => {
  const { data: logout, isPending } = LogoutUser(LogoutURL)

  const handleLogout = () => {
    logout()
  }

  return (
    <fieldset className='w-full max-w-md border border-gray-300 rounded-lg p-6 text-center align-middle bg-white dark:bg-gray-800 shadow-lg '>
      <legend>
        <h1>Log Out</h1>
      </legend>
      <button onClick={handleLogout} className={`btn btn-danger ${isPending ? 'opacity-70 cursor-not-allowed' : ''}`} disabled={isPending}>
        {isPending ? 'Logging out...' : 'Yes, I want to log out'}
      </button>
      <Nav />
    </fieldset>
  )
}

export default Login
