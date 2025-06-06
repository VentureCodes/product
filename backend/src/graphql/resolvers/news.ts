import { extendType } from 'nexus'
import { getNews } from '../../utils/request'

export const NewsQuery = extendType({
  type: 'Query',
  definition: (t) => {
    t.nonNull.list.nonNull.field('news', {
      type: 'News',
      resolve: async () => {
        return getNews() || []
      },
    })
  },
})
