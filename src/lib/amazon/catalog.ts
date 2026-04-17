import { spApi, MARKETPLACE_ID } from './client'

export interface CatalogItem {
  asin: string
  attributes?: Record<string, unknown>
  identifiers?: Array<{
    marketplaceId: string
    identifiers: Array<{ identifierType: string; identifier: string }>
  }>
  images?: Array<{
    marketplaceId: string
    images: Array<{ variant: string; link: string; height: number; width: number }>
  }>
  productTypes?: Array<{ marketplaceId: string; productType: string }>
  summaries?: Array<{
    marketplaceId: string
    brandName?: string
    browseNode?: string
    colorName?: string
    itemName?: string
    manufacturer?: string
    modelNumber?: string
    packageQuantity?: number
    partNumber?: string
    size?: string
    style?: string
    websiteDisplayGroup?: string
    websiteDisplayGroupName?: string
  }>
}

interface CatalogItemResponse {
  item: CatalogItem
}

const INCLUDE_DATA = ['attributes', 'identifiers', 'images', 'productTypes', 'summaries']

export async function getCatalogItem(asin: string): Promise<CatalogItem> {
  const res = await spApi<CatalogItemResponse>(`/catalog/2022-04-01/items/${asin}`, {
    params: {
      marketplaceIds: MARKETPLACE_ID,
      includedData: INCLUDE_DATA,
    },
  })
  return res.item
}

interface SearchCatalogResponse {
  numberOfResults: number
  items: CatalogItem[]
  pagination?: { nextToken?: string }
}

export async function searchCatalog(query: string, pageToken?: string): Promise<SearchCatalogResponse> {
  return spApi<SearchCatalogResponse>('/catalog/2022-04-01/items', {
    params: {
      marketplaceIds: MARKETPLACE_ID,
      keywords: query,
      includedData: INCLUDE_DATA,
      ...(pageToken ? { pageToken } : {}),
    },
  })
}
