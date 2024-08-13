import { Account, Prisma, User } from "@prisma/client";
import prisma from "@prisma/client";
import { Resource } from "@/interfaces/resource";

// Resource CRUD operations
export const createResource = async (
  data: Prisma.ResourceCreateInput,
): Promise<Resource> => {
  return await prisma.resource.create({
    data,
  });
};

export const getAllResources = async (): Promise<Resource[]> => {
  return await prisma.resource.findMany();
};

export const getResourceById = async (id: string): Promise<Resource | null> => {
  return await prisma.resource.findUnique({
    where: { id },
  });
};

export const updateResource = async (
  id: string,
  data: Prisma.ResourceUpdateInput,
): Promise<Resource> => {
  return await prisma.resource.update({
    where: { id },
    data,
  });
};

export const deleteResource = async (id: string): Promise<Resource> => {
  return (await prisma.resource.delete({
    where: { id },
  })) as Resource;
};

// User CRUD operations
export const createUser = async (
  data: Prisma.UserCreateInput,
): Promise<User> => {
  return await prisma.user.create({
    data,
  });
};

export const getUserById = async (id: string): Promise<User | null> => {
  return await prisma.user.findUnique({
    where: { id },
  });
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  return await prisma.user.findUnique({
    where: { email },
  });
};

export const updateUser = async (
  id: string,
  data: Prisma.UserUpdateInput,
): Promise<User> => {
  return await prisma.user.update({
    where: { id },
    data,
  });
};

export const deleteUser = async (id: string): Promise<User> => {
  return await prisma.user.delete({
    where: { id },
  });
};

// Account CRUD operations
export const createAccount = async (
  data: Prisma.AccountCreateInput,
): Promise<Account> => {
  return await prisma.account.create({
    data,
  });
};

export const getAccountById = async (id: string): Promise<Account | null> => {
  return await prisma.account.findUnique({
    where: { id },
  });
};

export const updateAccount = async (
  id: string,
  data: Prisma.AccountUpdateInput,
): Promise<Account> => {
  return await prisma.account.update({
    where: { id },
    data,
  });
};

export const deleteAccount = async (id: string): Promise<Account> => {
  return await prisma.account.delete({
    where: { id },
  });
};
