type OUTLINE_DOC = {
  id: string;
  url: string;
  urlId: string;
  name: string;
  description: string;
  sort: {
    field: string;
    direction: "asc" | "desc";
  };
  icon: string;
  index: string;
  color: string;
  permission: string | null;
  sharing: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  archivedAt: string | null;
}

type OUTLINE_DOCS_LIST = {
  pagination: {
    limit: number,
    offset: number,
    nextPath: string,
    total: number
  },
  data: OUTLINE_DOC[]
}

type SEARCH_DOC_ITEM = {
  ranking: number;
  context: string;
  document: OUTLINE_DOC
}

export type SEARCH_DOCS_LIST = SEARCH_DOC_ITEM[];

const getAllDocuments = async () => {
  const response = await fetch('https://notes.aimamin.com/api/collections.list', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Bun.env.OUTLINE_API_KEY}`
    },
    body: JSON.stringify({
        offset: 0,
        limit: 25,
        sort: 'updatedAt',
        direction: 'DESC',
        query: '',
    //   statusFilter: ['archived']
    })
  })
    
  const body = await response.json() as OUTLINE_DOCS_LIST;

  if(!body.data || body.data.length === 0) {
    throw new Error('No documents found')
  }

  return body
}

async function searchOutlineDocs(query: string) {
  const response = await fetch('https://notes.aimamin.com/api/documents.search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${Bun.env.OUTLINE_API_KEY}`
    },
    body: JSON.stringify({
      query: query,
      limit: 5, // Increase to 5 for better results
    })
  });
  
  // Check if response is OK before parsing
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Outline API Error:', response.status, errorText);
    throw new Error(`Outline API failed: ${response.status} - ${errorText}`);
  }
  
  const body = await response.json() as { data: SEARCH_DOCS_LIST };
  
  // Handle empty results
  if (!body.data || body.data.length === 0) {
    console.log(`No results found for query: "${query}"`);
    return [];
  }
  
  return body.data;
}

export {
  getAllDocuments,
  searchOutlineDocs
};