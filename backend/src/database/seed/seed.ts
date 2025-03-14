import { PrismaClient } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import {
  ITEMS_LIST,
  CATEGORIES_LIST,
  STORES_LIST,
  EVENTS_LIST,
  USERS_LIST,
} from './completeList';
import config from '../../config';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Seeding function will follow a set of steps to clear and re-populate all tables
async function populateDB() {
  // STEP 1: Clear all tables
  // console.log('Deleting all records...');

  // await prisma.events.deleteMany({});
  // await prisma.itemStore.deleteMany({});
  // await prisma.store.deleteMany({});
  // await prisma.subSubCategory.deleteMany({});
  // await prisma.subCategory.deleteMany({});
  // await prisma.category.deleteMany({});
  // await prisma.image.deleteMany({});
  // await prisma.item.deleteMany({});
  // await prisma.user.deleteMany({});

  // console.log('All tables have been cleared.');

  // STEP 2: Create categories
  console.log('Creating categories...');

  for (const cat of CATEGORIES_LIST) {
    const createdCategories = await prisma.category.create({
      data: {
        name: cat.name,
        hasDepth: cat.hasDepth,
        subCategories: {
          connectOrCreate: cat.subCategories.map((subCategory) => ({
            where: { name: subCategory.name },
            create: {
              name: subCategory.name,
              hasDepth: subCategory.hasDepth,
              subSubCategories: {
                connectOrCreate: subCategory.subSubCategories.map(
                  (subSubCategory) => ({
                    where: { name: subSubCategory.name },
                    create: { name: subSubCategory.name },
                  })
                ),
              },
            },
          })),
        },
      },
    });

    console.log('Created category:', createdCategories);
  }

  // STEP 3: Find or Create stores
  // console.log('Creating stores...');

  // const createdStores = await Promise.all(
  //   STORES_LIST.map(async (store) => {
  //     return prisma.store.upsert({
  //       where: { name: store.name },
  //       update: {},
  //       create: { name: store.name, logo: store.logo },
  //     });
  //   })
  // );

  // console.log('Created or Updated stores:', createdStores);

  // STEP 4: Create Items and connect them to a Category (ItemCategory) and a Store (ItemStore) sequentially
  console.log('Creating items...');

  for (const item of ITEMS_LIST) {
    const createdItems = await prisma.item.create({
      data: {
        name: item.name,
        model: item.model,
        brand: item.brand,
        description: item.description,

        // Connect to a Category
        categories: {
          connect: item.categories.map((category) => ({
            name: category.name,
          })),
        },

        // Connect to a SubCategory
        subCategories: {
          connect: item.subCategories.map((subCategory) => ({
            name: subCategory.name,
          })),
        },

        // Connect to a subSubCategory
        subSubCategories: {
          connect: item.subSubCategories.map((subSubCategory) => ({
            name: subSubCategory.name,
          })),
        },

        // Connect to a ItemStore and add URL
        stores: {
          create: item.stores.map((store) => ({
            store: {
              connect: {
                name: store.name,
              },
            },
            url: store.url,
          })),
        },
      },
    });

    console.log('Created items:', createdItems);
  }

  // STEP 5: Create events (Retrieving itemId + storeId first)
  console.log('Creating events...');

  async function createEvents() {
    await Promise.all(
      EVENTS_LIST.map(async (event) => {
        // Find itemId based on itemName
        const item = await prisma.item.findUnique({
          where: { name: event.itemName },
          select: { id: true },
        });

        if (!item) {
          console.warn(
            `Creation of events failed: Item "${event.itemName}" not found.`
          );
          return;
        }

        // Find storeId based on storeName
        const store = await prisma.store.findUnique({
          where: { name: event.storeName },
          select: { id: true },
        });

        if (!store) {
          console.warn(
            `Creation of events failed: store "${event.storeName}" not found.`
          );
          return;
        }

        // Create event with retrieved itemId and storeId
        const createdEvents = await prisma.events.create({
          data: {
            itemId: item.id,
            storeId: store.id,
            price: event.price,
            fromJob: event.fromJob,
            status: event.status,
          },
        });

        console.log('Created event:', createdEvents);
        return createEvents;
      })
    );
  }

  await createEvents();

  // STEP 6: Find or Create users
  // console.log('Creating users...');

  // let createdIds: string[] = [];
  // for (const user of USERS_LIST) {
  //   // Hash password
  //   const hashedPassword = await bcrypt.hash(user.password, 10);

  //   // Find or Create without specifying connection
  //   const result = await prisma.user.create({
  //     data: {
  //       id: user.id ?? undefined,
  //       firstName: user.firstName,
  //       lastName: user.lastName,
  //       email: user.email,
  //       phone: user.phone,
  //       password: hashedPassword,
  //       role: user.role,
  //       updatedById: undefined,
  //     },
  //   });

  //   createdIds.push(result.id);
  // }

  // // Specify the connection: SYSTEM created all new accounts
  // const createdUser = await prisma.user.update({
  //   where: { id: '01010101-ffff-1111-ffff-010101010101' },
  //   data: {
  //     updatedUsers: {
  //       connect: createdIds.map((id) => ({ id })),
  //     },
  //   },
  // });

  // console.log('Created user:', createdUser);
}

async function populateCloudinary() {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.key,
    api_secret: config.cloudinary.secret,
  });

  // STEP 7: Upload new images to Cloudinary
  // Get all images
  const imageDir = path.join(__dirname, 'images');
  const fileNames = fs.readdirSync(imageDir);

  // Loop all images
  for (const fileName of fileNames) {
    if (fileName.includes('Logo')) {
      console.warn(`Skipping invalid filename: ${fileName}`);
      continue;
    }

    let imageData = {
      model: '',
      brand: '',
      number: '',
    };

    // Get info from fileName
    const parts = fileName.split('_');
    imageData = {
      brand: parts[0],
      model: parts[1],
      number: parts[2].split('.')[0],
    };

    if (parts.length != 3) {
      throw new Error(`Invalid filename format: ${fileName}`);
    }

    const publicId = `${imageData.brand}/${imageData.model}/${imageData.brand}_${imageData.model}_${imageData.number}`;

    // Check if image is already in Cloudinary
    let image;
    try {
      image = await cloudinary.api.resource(`Items/${publicId}`);
    } catch (error: any) {
      if (error.error.message.includes('not found')) {
        console.error('Image not found on Cloudinary');
      }
    }

    // console.log(image);

    // If image was not found we try to upload
    if (!image) {
      console.log('Uploading image to Cloudinary...');
      const result = await cloudinary.uploader.upload(
        path.join(imageDir, fileName),
        {
          public_id: publicId,
          folder: 'Items',
          use_filename: true,
          unique_filename: false,
          overwrite: false,
        }
      );

      // console.log(result);
    } else {
      console.log('Image found in Cloudinary...');
    }

    // Generate url
    const url = cloudinary.url(`Items/${publicId}`, {
      transformation: [
        {
          quality: 'auto',
          fetch_format: 'auto',
        },
        {
          crop: 'fill',
          gravity: 'auto',
        },
      ],
    });

    // Save publicId in DB as cloudinaryId
    // Find the Item and then update
    console.log('Updating Item in DB...');

    const item = await prisma.item.findFirst({
      where: {
        AND: [
          {
            model: {
              equals: imageData.model,
            },
          },
          {
            brand: {
              equals: imageData.brand,
            },
          },
        ],
      },
    });

    await prisma.item.update({
      where: {
        id: item?.id,
      },
      data: {
        images: {
          connectOrCreate: {
            where: {
              name: `${imageData.brand}_${imageData.model}_${imageData.number}`,
            },
            create: {
              name: `${imageData.brand}_${imageData.model}_${imageData.number}`,
              cloudinaryId: publicId,
              url: url,
            },
          },
        },
      },
    });

    console.log('Image updated in Item id:', item?.id);
  }
}

// populateDB().catch((e) => console.error(e));

populateCloudinary()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
