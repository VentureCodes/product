import { JwtPayload } from 'jsonwebtoken'

/**
 * User Interface
 */
export interface IUserPayload extends JwtPayload {
  id: string
  email: string | null
  phone: string | null
  userType: string
  firstName: string | null
  lastName: string | null
  username: string | null
  referralLink: string | null
  isActive: boolean
  createdAt: Date
}
