export const config = {
  togetherAI: {
    apiKey: 'tgp_v1_DL-451JV0ipiPW7u52MPR5BQ_VS1Bd8OPqe3TKDre10',
  },
  supabase: {
    accessToken: 'sbp_3dcda32c7c4e77998db033ee77547b8e0567240f',
    mcpServer: {
      command: 'cmd',
      args: [
        '/c',
        'npx',
        '-y',
        '@supabase/mcp-server-supabase@latest',
        '--access-token',
        'sbp_3dcda32c7c4e77998db033ee77547b8e0567240f'
      ]
    }
  }
};