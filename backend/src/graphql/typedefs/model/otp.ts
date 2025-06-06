import { objectType } from 'nexus'
import * as Model from 'nexus-prisma'

export const Otp = objectType({
  name: Model.Otp.$name,
  description: Model.Otp.$description,
  definition: (t) => {
    t.field(Model.Otp.id)
    t.field(Model.Otp.user)
    t.field(Model.Otp.userId)
    t.field(Model.Otp.type)
    t.field(Model.Otp.isUsed)
    t.field(Model.Otp.expiresAt)
    t.field(Model.Otp.createdAt)
    t.field(Model.Otp.updatedAt)
  },
})
