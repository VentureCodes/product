import { objectType } from 'nexus'

export const News = objectType({
  name: 'News',
  definition(t) {
    t.string('title')
    t.string('description')
    t.string('imageUrl')
    t.string('link')
    t.string('date')
  },
})
