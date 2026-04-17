import { spApi, MARKETPLACE_ID } from './client'

export interface ListingItem {
  sku: string
  summaries?: Array<{
    marketplaceId: string
    asin?: string
    productType?: string
    conditionType?: string
    status?: string[]
    itemName?: string
    createdDate?: string
    lastUpdatedDate?: string
    mainImage?: { link: string; height: number; width: number }
  }>
  attributes?: Record<string, unknown>
  issues?: Array<{
    code: string
    message: string
    severity: 'ERROR' | 'WARNING' | 'INFO'
    attributeNames?: string[]
  }>
  offers?: Array<{
    marketplaceId: string
    offerType: string
    price: { currency: string; amount: string }
  }>
  fulfillmentAvailability?: Array<{
    fulfillmentChannelCode: string
    quantity?: number
  }>
}

interface ListingItemResponse {
  sku: string
  summaries?: ListingItem['summaries']
  attributes?: ListingItem['attributes']
  issues?: ListingItem['issues']
  offers?: ListingItem['offers']
  fulfillmentAvailability?: ListingItem['fulfillmentAvailability']
}

const INCLUDE_DATA = ['summaries', 'attributes', 'issues', 'offers', 'fulfillmentAvailability']

export async function getListing(sellerId: string, sku: string): Promise<ListingItemResponse> {
  return spApi<ListingItemResponse>(
    `/listings/2021-08-01/items/${sellerId}/${encodeURIComponent(sku)}`,
    {
      params: {
        marketplaceIds: MARKETPLACE_ID,
        includedData: INCLUDE_DATA,
      },
    }
  )
}

interface ListingsSearchResponse {
  items: ListingItemResponse[]
  pagination?: { nextToken?: string }
}

export async function getListings(sellerId: string, pageToken?: string): Promise<ListingsSearchResponse> {
  return spApi<ListingsSearchResponse>(`/listings/2021-08-01/items/${sellerId}`, {
    params: {
      marketplaceIds: MARKETPLACE_ID,
      includedData: INCLUDE_DATA,
      pageSize: '20',
      ...(pageToken ? { pageToken } : {}),
    },
  })
}

/** Detects suppression issues in a listing */
export function extractIssues(listing: ListingItemResponse) {
  const issues = listing.issues ?? []
  const suppressed = listing.summaries?.some(s => s.status?.includes('SUPPRESSED')) ?? false
  const errors = issues.filter(i => i.severity === 'ERROR')
  const warnings = issues.filter(i => i.severity === 'WARNING')
  return { suppressed, errors, warnings, allIssues: issues }
}
