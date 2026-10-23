import { APIRequestContext } from 'playwright-core'
import { Login } from '../dto/login-dto'
import { StatusCodes } from 'http-status-codes'
import { expect } from '@playwright/test'

export const baseUrl = 'https://backend.tallinn-learning.ee'
export const loginEndpoint = '/login/student'
export const ordersEndpoint = '/orders'

export async function fetchJwt(request: APIRequestContext, login: Login): Promise<string> {
  const authResponse = await request.post(baseUrl + loginEndpoint, {
    data: login,
  })
  if (authResponse.status() !== StatusCodes.OK) {
    throw new Error(`Authorization failed. Status: ${authResponse.status()}`)
  }
  return await authResponse.text()
}

export async function createOrder(request: APIRequestContext, jwt: string): Promise<number> {
  const response = await request.post(baseUrl + ordersEndpoint, {
    data: {
      "status": "OPEN",
      "courierId": 0,
      "customerName": "vladimir",
      "customerPhone": "55445566",
      "comment": "hello",
      "id": 0
    },
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  })
  expect(response.status()).toBe(StatusCodes.OK)
  const responseBody = await response.json()
  return responseBody.id
}

