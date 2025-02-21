export const paths = {
  home: {
    path: '/',
    getHref: () => '/',
  },

  auth: {
    register: {
      path: '/auth/register',
      getHref: (redirectTo?: string | null | undefined) =>
        `/auth/register${
          redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''
        }`,
    },
    login: {
      path: '/auth/login',
      getHref: (redirectTo?: string | null | undefined) =>
        `/auth/login${
          redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''
        }`,
    },
  },

  app: {
    allCategories: {
      path: '/all-categories',
      getHref: () => '/all-categories',
    },
    search: {
      path: '/search',
      getHref: (query: string) => `/search?q=${encodeURIComponent(query)}`,
    },
    item: {
      path: '/item/:brand/:model',
      getHref: (brand: string, model: string) =>
        `/item/${encodeURIComponent(brand)}/${encodeURIComponent(model)}`,
    },
  },
} as const;
