import { NextRequest, NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

const MONGO_URI = process.env.MONGO_URI

if (!MONGO_URI) {
  throw new Error("MONGO_URI is not defined in environment variables")
}
const DB_NAME = 'hobbytribe'
const COLLECTION_NAME = 'students'
console.log("MONGO_URI:", process.env.MONGO_URI)
let client: MongoClient
let clientPromise: Promise<MongoClient>

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

if (!global._mongoClientPromise) {
  client = new MongoClient(MONGO_URI)
  global._mongoClientPromise = client.connect()
}
clientPromise = global._mongoClientPromise

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    const searchQuery = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const skip = (page - 1) * limit

    const client = await clientPromise
    const db = client.db(DB_NAME)
    const collection = db.collection(COLLECTION_NAME)

    let filter: any = {}

    if (searchQuery) {
      filter = {
        $or: [
          { studentName: { $regex: searchQuery, $options: 'i' } },
          { parentName: { $regex: searchQuery, $options: 'i' } },
          { callingNumber: { $regex: searchQuery, $options: 'i' } },
        ],
      }
    }

    const total = await collection.countDocuments(filter)

    const students = await collection
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    return NextResponse.json({
      success: true,
      students,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('API ERROR:', error)

    return NextResponse.json({
      success: false,
      students: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 10,
        pages: 0,
      },
    })
  }
}