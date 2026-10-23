import { expect, test } from '@playwright/test'
import { Login } from '../../dto/login-dto'
import { createOrder, fetchJwt, baseUrl, ordersEndpoint } from '../../helpers/api-helper'
import { StatusCodes } from 'http-status-codes'

let loginDto: Login

test.describe('GET positive tests', () => {
  let orderId: number
  let token: string

  test.beforeAll(() => {
    loginDto = new Login(process.env.DL_USERNAME!, process.env.DL_PASSWORD!)
  })

  test.beforeEach(async ({ request }) => {
    token = await fetchJwt(request, loginDto)
    orderId = await createOrder(request, token)

    const orderWithID = await request.get(baseUrl + ordersEndpoint + `/${orderId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const respBody = await orderWithID.json()

    expect(respBody.id).toBe(orderId)
  })

  test.afterEach(async ({ request }) => {
    const deleteAccount = await request.delete(baseUrl + ordersEndpoint + `/${orderId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    expect(deleteAccount.status()).toBe(StatusCodes.OK)

    const orderWithID = await request.get(baseUrl + ordersEndpoint + `/${orderId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    const respBody = await orderWithID.text()
    expect(respBody).toBe('')
  })

  test('TL-12-1 get all orders', async ({ request }) => {
    const response = await request.get(baseUrl + ordersEndpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    expect(response.status()).toBe(200)

    const orders = await response.json()
    console.log('Orders:', JSON.stringify(orders, null, 2))
    expect(orders).toBeTruthy()
  })

  test('TL-12-2 get order with id', async ({ request }) => {
    const response = await request.get(baseUrl + ordersEndpoint + `/${orderId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    expect(response.status()).toBe(StatusCodes.OK)
    const order = await response.json()
    console.log('Orders:', JSON.stringify(order, null, 2))
    expect(order).toBeTruthy()
  })
})

test.describe('GET negative tests', () => {
  let token: string
  test.beforeAll(async ({ request }) => {
    loginDto = new Login(process.env.DL_USERNAME!, process.env.DL_PASSWORD!)
    token = await fetchJwt(request, loginDto)
  })

  test.fail('TL-12-3 get order with invalid id', async ({ request }) => {
    const invalidId = 1000000
    const response = await request.get(baseUrl + ordersEndpoint + `/${invalidId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const respBody = await response.json()
    console.log(respBody)

    expect(response.status()).toBe(StatusCodes.BAD_REQUEST)
  })

  test('TL-12-4 get order with invalid id', async ({ request }) => {
    const invalidId = 'aaa'
    const response = await request.get(baseUrl + ordersEndpoint + `/${invalidId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const respBody = await response.json()
    console.log(respBody)

    expect(response.status()).toBe(StatusCodes.BAD_REQUEST)
  })

  test('TL-12-5 get order with invalid id', async ({ request }) => {
    const invalidId = '{10}'
    const response = await request.get(baseUrl + ordersEndpoint + `/${invalidId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const respBody = await response.json()
    console.log(respBody)

    expect(response.status()).toBe(StatusCodes.BAD_REQUEST)
  })

  test('TL-12-6 get order without authorization', async ({ request }) => {
    const response = await request.get(baseUrl + ordersEndpoint + `/10`, {})

    const respBody = await response.text()
    console.log(respBody)

    expect(response.status()).toBe(StatusCodes.UNAUTHORIZED)
  })
})

test.describe('DELETE negative tests', () => {
  let token: string

  test.beforeAll(async ({ request }) => {
    loginDto = new Login(process.env.DL_USERNAME!, process.env.DL_PASSWORD!)
    token = await fetchJwt(request, loginDto)
  })

  test.fail('TL-12-7 delete order with invalid id', async ({ request }) => {
    const invalidId = 100000000000
    const response = await request.delete(baseUrl + ordersEndpoint + `/${invalidId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const respBody = await response.json()
    console.log(respBody)

    expect(response.status()).toBe(StatusCodes.BAD_REQUEST)
  })

  test('TL-12-8 delete order with invalid id', async ({ request }) => {
    const invalidId = 'aaa'
    const response = await request.delete(baseUrl + ordersEndpoint + `/${invalidId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const respBody = await response.json()
    console.log(respBody)

    expect(response.status()).toBe(StatusCodes.BAD_REQUEST)
  })
})

test.describe('POST negative tests', () => {
  let token: string

  test.beforeAll(async ({ request }) => {
    loginDto = new Login(process.env.DL_USERNAME!, process.env.DL_PASSWORD!)
    token = await fetchJwt(request, loginDto)
  })

  test('TL-12-9 post without data', async ({ request }) => {
    const response = await request.post(baseUrl + ordersEndpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const respBody = await response.text()
    console.log(respBody)

    expect(response.status()).toBe(StatusCodes.BAD_REQUEST)
  })
})
