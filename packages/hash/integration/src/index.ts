export { };
import { GraphQLClient } from "graphql-request";
import { createOrgs, createUsers } from "./namespaces";
import { createEntity } from "./graphql/queries/entity.queries";
import {
  CreateEntityMutationVariables,
  CreateEntityMutation,
} from "./graphql/autoGeneratedTypes";

// TODO: import this from the backend
enum Visibility {
  Private = "PRIVATE",
  Public = "PUBLIC",
}

(async () => {
  const client = new GraphQLClient("http://localhost:5001/graphql");

  const [users, orgs] = await Promise.all([
    await createUsers(client),
    await createOrgs(client),
  ]);

  const results = new Map<string, CreateEntityMutation>();

  /** Create all entities specified in the `items` map and add the mutation's response
   * to the `results` map.
   */
  const createEntities = async (
    items: Map<string, CreateEntityMutationVariables>
  ) => {
    const names = Array.from(items.keys());
    const mutations = await Promise.all(
      Array.from(items.values()).map(
        async (val) => await client.request<CreateEntityMutation>(createEntity, val)
      )
    );
    mutations.forEach((res, i) => {
      const name = names[i];
      results.set(name, res);
    });
  };

  const user = users.find((user) => user.properties.shortname === "ciaran");
  if (!user) {
    throw new Error("user not found");
  }
  const org = orgs.find((org) => org.properties.shortname === "hash");
  if (!org) {
    throw new Error("org not found");
  }

  await createEntities(
    new Map([
      [
        "text1",
        {
          type: "Text",
          namespaceId: user.namespaceId,
          createdById: user.id,
          properties: {
            texts: [{ text: "About me", bold: true }],
          },
        },
      ],
      [
        "header1",
        {
          type: "Text",
          namespaceId: user.namespaceId,
          createdById: user.id,
          properties: {
            texts: [{ text: "My colleagues", bold: true }],
          },
        },
      ],
      [
        "divider1",
        {
          type: "Divider",
          namespaceId: user.namespaceId,
          createdById: user.id,
          properties: {},
        },
      ],
      [
        "text2",
        {
          type: "Text",
          namespaceId: user.namespaceId,
          createdById: user.id,
          properties: {
            texts: [
              { text: "A paragraph of regular text " },
              { text: "with", bold: true },
              { text: " " },
              { text: "some", italics: true },
              { text: " " },
              { text: "formatting", underline: true },
              { text: " " },
              { text: "included", bold: true, italics: true, underline: true },
              { text: "." },
            ],
          },
        },
      ],
      [
        "text3",
        {
          type: "Text",
          namespaceId: user.namespaceId,
          createdById: user.id,
          properties: {
            texts: [{ text: "A paragraph of italic text", italics: true }],
          },
        },
      ],
      [
        "text4",
        {
          type: "Text",
          namespaceId: user.namespaceId,
          createdById: user.id,
          properties: {
            texts: [{ text: "A paragraph of underline text", underline: true }],
          },
        },
      ],
      [
        "text5",
        {
          type: "Text",
          namespaceId: org.id,
          createdById: user.id,
          properties: {
            texts: [{ text: "HASH's Header Text", bold: true }],
          },
        },
      ],
    ])
  );

  await createEntities(
    new Map([
      [
        "place1",
        {
          type: "Location",
          properties: {
            country: "UK",
            name: "London",
          },
          namespaceId: user.namespaceId,
          createdById: user.id,
        },
      ],
      [
        "place2",
        {
          type: "Location",
          properties: {
            country: "FR",
            name: "Nantes",
          },
          namespaceId: user.namespaceId,
          createdById: user.id,
        },
      ],
      [
        "c1",
        {
          properties: {
            name: "HASH",
            url: "https://hash.ai",
          },
          type: "Company",
          namespaceId: user.namespaceId,
          createdById: user.id,
        },
      ],
    ])
  );

  await createEntities(
    new Map([
      [
        "p1",
        {
          type: "Person",
          properties: {
            email: "aj@hash.ai",
            name: "Akash Joshi",
            employer: {
              __linkedData: {
                entityType: "Company",
                entityId: results.get("c1")?.createEntity.id,
              },
            },
          },
          namespaceId: user.namespaceId,
          createdById: user.id,
        },
      ],
      [
        "p2",
        {
          properties: {
            email: "c@hash.ai",
            name: "Ciaran Morinan",
            employer: {
              __linkedData: {
                entityType: "Company",
                entityId: results.get("c1")?.createEntity.id,
              },
            },
          },
          type: "Person",
          namespaceId: user.namespaceId,
          createdById: user.id,
        },
      ],
      [
        "p3",
        {
          properties: {
            email: "d@hash.ai",
            name: "David Wilkinson",
            employer: {
              __linkedData: {
                entityType: "Company",
                entityId: results.get("c1")?.createEntity.id,
              },
            },
          },
          namespaceId: user.namespaceId,
          createdById: user.id,
          type: "Person",
        },
      ],
      [
        "p4",
        {
          properties: {
            email: "ef@hash.ai",
            name: "Eadan Fahey",
            employer: {
              __linkedData: {
                entityType: "Company",
                entityId: results.get("c1")?.createEntity.id,
              },
            },
          },
          type: "Person",
          namespaceId: user.namespaceId,
          createdById: user.id,
        },
      ],
      [
        "p5",
        {
          properties: {
            email: "nh@hash.ai",
            name: "Nate Higgins",
            employer: {
              __linkedData: {
                entityType: "Company",
                entityId: results.get("c1")?.createEntity.id,
              },
            },
          },
          type: "Person",
          namespaceId: user.namespaceId,
          createdById: user.id,
        },
      ],
      [
        "p6",
        {
          properties: {
            email: "mr@hash.ai",
            name: "Marius Runge",
            employer: {
              __linkedData: {
                entityType: "Company",
                entityId: results.get("c1")?.createEntity.id,
              },
            },
          },
          type: "Person",
          namespaceId: user.namespaceId,
          createdById: user.id,
        },
      ],
    ])
  );

  await createEntities(
    new Map([
      [
        "t1",
        {
          type: "Table",
          namespaceId: user.namespaceId,
          createdById: user.id,
          properties: {
            initialState: {
              hiddenColumns: [
                "id",
                "__typename",
                "createdById",
                "namespaceId",
                "createdAt",
                "updatedAt",
                "visibility",
                "properties.employer.__typename",
                "properties.employer.createdAt",
                "properties.employer.createdById",
                "properties.employer.id",
                "properties.employer.namespaceId",
                "properties.employer.type",
                "properties.employer.updatedAt",
                "properties.employer.visibility",
                "properties.employer.properties.location.__typename",
                "properties.employer.properties.location.createdAt",
                "properties.employer.properties.location.createdById",
                "properties.employer.properties.location.id",
                "properties.employer.properties.location.namespaceId",
                "properties.employer.properties.location.type",
                "properties.employer.properties.location.updatedAt",
                "properties.employer.properties.location.visibility",
              ],
            },
            data: {
              __linkedData: {
                entityType: "Person",
                aggregate: {
                  perPage: 5,
                  sort: {
                    field: "createdAt",
                  },
                },
              },
            },
          },
        },
      ],
    ])
  );

  await createEntities(
    new Map([
      [
        "b1",
        {
          type: "Block",
          properties: {
            componentId: "https://block.blockprotocol.org/header",
            entityType: "Text",
            entityId: results.get("text1")?.createEntity.id,
            namespaceId: results.get("text1")?.createEntity.namespaceId,
          },
          createdById: user.id,
          namespaceId: user.namespaceId,
        },
      ],
      [
        "b2",
        {
          properties: {
            componentId: "https://block.blockprotocol.org/paragraph",
            entityType: "Text",
            entityId: results.get("text2")?.createEntity.id,
            namespaceId: results.get("text2")?.createEntity.namespaceId,
          },
          createdById: user.id,
          namespaceId: user.namespaceId,
          type: "Block",
        },
      ],
      [
        "b3",
        {
          properties: {
            componentId: "https://block.blockprotocol.org/paragraph",
            entityType: "Text",
            entityId: results.get("text3")?.createEntity.id,
            namespaceId: results.get("text3")?.createEntity.namespaceId,
          },
          createdById: user.id,
          namespaceId: user.namespaceId,
          type: "Block",
        },
      ],
      [
        "b4",
        {
          properties: {
            componentId: "https://block.blockprotocol.org/table",
            entityType: "Table",
            entityId: results.get("t1")?.createEntity.id,
            namespaceId: results.get("t1")?.createEntity.namespaceId,
          },
          createdById: user.id,
          namespaceId: user.namespaceId,
          type: "Block",
        },
      ],
      [
        "b5",
        {
          properties: {
            componentId: "https://block.blockprotocol.org/header",
            entityType: "Text",
            entityId: results.get("text5")?.createEntity.id,
            namespaceId: results.get("text5")?.createEntity.namespaceId,
          },
          createdById: user.id,
          namespaceId: org.id,
          type: "Block",
        },
      ],
      [
        "b6",
        {
          properties: {
            componentId: "https://block.blockprotocol.org/paragraph",
            entityType: "Text",
            entityId: results.get("text2")?.createEntity.id,
            namespaceId: results.get("text2")?.createEntity.namespaceId,
          },
          createdById: user.id,
          namespaceId: org.id,
          type: "Block",
        },
      ],
      [
        "b7",
        {
          properties: {
            componentId: "https://block.blockprotocol.org/paragraph",
            entityType: "Text",
            entityId: results.get("text3")?.createEntity.id,
            namespaceId: results.get("text3")?.createEntity.namespaceId,
          },
          createdById: user.id,
          namespaceId: org.id,
          type: "Block",
        },
      ],
      [
        "b8",
        {
          properties: {
            componentId: "https://block.blockprotocol.org/paragraph",
            entityType: "Text",
            entityId: results.get("text4")?.createEntity.id,
            namespaceId: results.get("text4")?.createEntity.namespaceId,
          },
          createdById: user.id,
          namespaceId: org.id,
          type: "Block",
        },
      ],
      [
        "b9",
        {
          properties: {
            componentId: "https://block.blockprotocol.org/person",
            entityType: "Person",
            entityId: results.get("p2")?.createEntity.id,
            namespaceId: results.get("p2")?.createEntity.namespaceId,
          },
          createdById: user.id,
          namespaceId: org.id,
          type: "Block",
        },
      ],
      [
        "b10",
        {
          properties: {
            componentId: "https://block.blockprotocol.org/header",
            entityType: "Text",
            entityId: results.get("header1")?.createEntity.id,
            namespaceId: results.get("header1")?.createEntity.namespaceId,
          },
          createdById: user.id,
          namespaceId: org.id,
          type: "Block",
        },
      ],
      [
        "b11",
        {
          properties: {
            componentId: "https://block.blockprotocol.org/divider",
            entityType: "Divider",
            entityId: results.get("divider1")?.createEntity.id,
            namespaceId: results.get("divider1")?.createEntity.namespaceId,
          },
          createdById: user.id,
          namespaceId: org.id,
          type: "Block",
        },
      ],
    ])
  );

  await createEntities(
    new Map([
      [
        "page1",
        {
          type: "Page",
          namespaceId: user.namespaceId,
          createdById: user.id,
          properties: {
            contents: [
              {
                entityId: results.get("b1")?.createEntity.id,
                namespaceId: results.get("b1")?.createEntity.namespaceId,
              },
              {
                entityId: results.get("b9")?.createEntity.id,
                namespaceId: results.get("b9")?.createEntity.namespaceId,
              },
              {
                entityId: results.get("b11")?.createEntity.id,
                namespaceId: results.get("b11")?.createEntity.namespaceId,
              },
              {
                entityId: results.get("b2")?.createEntity.id,
                namespaceId: results.get("b2")?.createEntity.namespaceId,
              },
              {
                entityId: results.get("b3")?.createEntity.id,
                namespaceId: results.get("b3")?.createEntity.namespaceId,
              },
              {
                entityId: results.get("b10")?.createEntity.id,
                namespaceId: results.get("b10")?.createEntity.namespaceId,
              },
              {
                entityId: results.get("b4")?.createEntity.id,
                namespaceId: results.get("b4")?.createEntity.namespaceId,
              },
            ],
            title: "My awesome page",
          },
          visibility: Visibility.Public,
        },
      ],
      [
        "page2",
        {
          type: "Page",
          namespaceId: org.namespaceId,
          createdById: user.id,
          properties: {
            contents: [
              {
                entityId: results.get("b5")?.createEntity.id,
                namespaceId: results.get("b5")?.createEntity.namespaceId,
              },
              {
                entityId: results.get("b6")?.createEntity.id,
                namespaceId: results.get("b6")?.createEntity.namespaceId,
              },
              {
                entityId: results.get("b7")?.createEntity.id,
                namespaceId: results.get("b7")?.createEntity.namespaceId,
              },
              {
                entityId: results.get("b8")?.createEntity.id,
                namespaceId: results.get("b8")?.createEntity.namespaceId,
              },
            ],
            title: "HASH's 1st page",
          },
          visibility: Visibility.Public,
        },
      ],
    ])
  );

  console.log("Mock data created");
})();
