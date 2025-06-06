import { inputObjectType } from 'nexus'

export const RateCategoryWhereUniqueInput = inputObjectType({
  name: 'RateCategoryWhereUniqueInput',
  definition(t) {
    t.string('id')
  },
})

export const RateCategoryWhereInput = inputObjectType({
  name: 'RateCategoryWhereInput',
  definition(t) {
    t.string('name')
    t.boolean('isActive')
  },
})

export const RateCategoryOrderByInput = inputObjectType({
  name: 'RateCategoryOrderByInput',
  definition(t) {
    t.field('name', { type: 'SortOrder' })
    t.field('createdAt', { type: 'SortOrder' })
    t.field('updatedAt', { type: 'SortOrder' })
  },
})

export const RateCategoryCreateInput = inputObjectType({
  name: 'RateCategoryCreateInput',
  definition(t) {
    t.string('name')
    t.string('description')
    t.string('icon')
    t.boolean('isActive')
  },
})

export const RateCategoryUpdateInput = inputObjectType({
  name: 'RateCategoryUpdateInput',
  definition(t) {
    t.string('name')
    t.string('description')
    t.string('icon')
    t.boolean('isActive')
  },
})
