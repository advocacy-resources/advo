import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";
import { Category } from "@prisma/client";

export interface IResourceSearchPostRequest {
  ageRange: string;
  zipCode: string;
  category: Category;
  description: string;
  type: string[];
}

export async function POST(request: NextRequest) {
  const {
    // ageRange,
    zipCode,
    category,
    description: descriptionOrUndefined,
    type,
  } = (await request.json()) as IResourceSearchPostRequest;

  const description = descriptionOrUndefined || " ";

  const optionalQueryParams: {}[] = [
    {
      text: {
        query: type,
        path: "type",
      },
    },
  ];

  if (zipCode !== "") {
    optionalQueryParams.push({
      text: {
        query: zipCode,
        path: "zipCode",
      },
    });
  }

  // Perform the search based on the constructed where conditions
  const resources = await prisma.resource.aggregateRaw({
    pipeline: [
      {
        $search: {
          index: "resource_index",
          compound: {
            must: [
              {
                text: {
                  query: category,
                  path: "category",
                },
              },
            ],
            should: [
              {
                text: {
                  query: description,
                  path: ["name", "description"],
                },
              },
            ],
          },
        },
      },
      {
        $project: {
          _id: 1,
          id: 1,
          name: 1,
          description: 1,
          category: 1,
          type: 1,
          ageRange: 1,
          zipCode: 1,
        },
      },
    ],
  });

  return NextResponse.json(resources);
}
