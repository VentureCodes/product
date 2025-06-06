import { JwtPayload } from 'jsonwebtoken'

export interface IJwtPayload extends JwtPayload {
  id: string
  phone: string
  email?: string
  userType?: string
  firstName?: string
  lastName?: string
  username?: string
  isActive: boolean
  createdAt: Date
}

export interface MamlakaSession {
  session: string
  expiresAt: Date
}
