import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "./lib/prisma";
import jwt from "jsonwebtoken";
import fs from "fs";
import { join } from "path";
import { validateJwt } from "./middlewares/auth";

interface LoginData {
  email: string;
  password: string;
}

export async function appRoutes(app: FastifyInstance) {
  app.post("/login", async (req, res) => {
    const { email, password } = req.body as LoginData;

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return console.log({ error: "User not found" });
    }

    const match = await (password == user.password);

    if (!match) {
      return console.log({ error: "Invalid credentials" });
    }

    if (match || user) {
      let token = jwt.sign({ userId: user.id }, "mysecret");

      return res.send({
        token: token,
        email: user.email,
        name: user.firstName,
        id: user.id,
      });
    }
  });

  app.post(
    "/products/store",
    { preHandler: [validateJwt] },
    async (request, response) => {
      const createProduct = z.object({
        name: z.string(),
        type: z.string(),
        price: z.string(),
        code: z.string(),
        attachmentEquip: z.any(),
      });

      const { name, type, code, price, attachmentEquip } = createProduct.parse(
        request.body
      );

      try {
        const productAlreadyExists = await prisma.product.findFirst({
          where: { name },
        });

        if (productAlreadyExists) {
          return response.status(409).send({ error: "Product already exists" });
        }

        const codeAlreadyExists = await prisma.product.findFirst({
          where: { code },
        });

        if (codeAlreadyExists) {
          return response.status(409).send({ error: "Code already exists" });
        }

        if (attachmentEquip != " ") {
          const fileName = attachmentEquip.toLowerCase();
          if (
            fileName.endsWith(".pdf") ||
            fileName.endsWith(".jpg") ||
            fileName.endsWith(".png") ||
            fileName.endsWith(".jpeg")
          ) {
          } else {
            return response.status(404).send({
              message: "Unsupported document format.",
            });
          }
        }

        const newProduct = await prisma.product.create({
          data: {
            code,
            name,
            type,
            price,
            attachmentEquip,
          },
        });

        return response.send();
      } catch (error) {
        return response
          .status(500)
          .send({ error: "Error while creating account" });
      }
    }
  );

  app.get("/products", { preHandler: [validateJwt] }, async (req, res) => {
    try {
      const products = await prisma.product.findMany();

      return res.send(products);
    } catch (error) {
      console.error(error);
      return res.status(500).send({ error: "Internal server error" });
    }
  });

  app.delete(
    "/product/:id/delete",
    { preHandler: [validateJwt] },
    async (req: any, res) => {
      const { id } = req.params;

      try {
        const deletedProduct = await prisma.product.delete({
          where: {
            id: req.id,
          },
        });

        res.send(deletedProduct);
      } catch (error) {
        res.status(500).send({ error: "Error delete product" });
      }
    }
  );

  app.put(
    "/product/:id/edit",
    { preHandler: [validateJwt] },
    async (req: any, res) => {
      const { id } = req.params;

      try {
        const updatedProduct = await prisma.user.update({
          where: {
            id: req.id,
          },
          data: {
            firstName: req.firstName,
            lastName: req.lastName,
            email: req.email,
            password: req.password,
            position: req.position,
            phone: req.phone,
            cpf: req.cpf,
            dateBirth: req.dateBirth,
          },
        });

        res.send(updatedProduct);
      } catch (error) {
        res.status(500).send({ error: "Error edit product" });
      }
    }
  );

  app.get("/product/:id/show", async (req, res) => {
    const id = req.params;

    try {
      const product = await prisma.product.findUnique({
        where: {
          id: req.id,
        },
      });

      if (!product) {
        return console.log({ error: "Product not found" });
      }

      return res.send(product);
    } catch (error) {
      return res.status(500).send({ error: "Error searching product" });
    }
  });

  app.post(
    "/person/store",
    { preHandler: [validateJwt] },
    async (request, response) => {
      const createPerson = z.object({
        firstName: z.string(),
        lastName: z.string(),
        email: z.string(),
        password: z.string(),
        position: z.string(),
        phone: z.string(),
        cpf: z.string(),
        dateBirth: z.string(),
      });

      const {
        firstName,
        lastName,
        email,
        password,
        position,
        phone,
        cpf,
        dateBirth,
      } = createPerson.parse(request.body);

      try {
        const accountAlreadyExists = await prisma.user.findFirst({
          where: { email },
        });

        if (accountAlreadyExists) {
          return response.status(409).send({ error: "E-mail already exists" });
        }

        const newPerson = await prisma.user.create({
          data: {
            firstName,
            lastName,
            email,
            password,
            position,
            phone,
            cpf,
            dateBirth,
          },
        });

        return response.send();
      } catch (error) {
        return response
          .status(500)
          .send({ error: "Error while creating account" });
      }
    }
  );

  app.get("/person/all", async (req, res) => {
    try {
      const people = await prisma.user.findMany();
      return res.send(people);
    } catch (error) {
      return res.status(500).send({ error: "Error searching people" });
    }
  });

  app.delete("/person/:id/delete", async (req: any, res) => {
    const { id } = req.params;

    try {
      const deletedPerson = await prisma.user.delete({
        where: {
          id: req.params.id,
        },
      });

      res.send(deletedPerson);
    } catch (error) {
      res.status(500).send({ error: "Error delete person" });
    }
  });

  app.put("/person/:id/update", async (req: any, res) => {
    const { id } = req.params;
    const {
      cpf,
      dateBirth,
      email,
      firstName,
      lastName,
      phone,
      password,
      position,
    } = req.body;

    console.log("req", req.body);

    try {
      const updatedPerson = await prisma.user.update({
        where: {
          id: id,
        },
        data: {
          cpf: cpf,
          dateBirth: dateBirth,
          email: email,
          firstName: firstName,
          phone: phone,
          lastName: lastName,
          password: password,
          position: position,
        },
      });
    } catch (error) {
      res.status(500).send({ error: "Error edit person" });
    }
  });

  app.get("/person/cart", { preHandler: [validateJwt] }, async (req, res) => {
    try {
      const cart = await prisma.cart.findFirst({
        where: {
          userId: req.user.id,
        },
      });

      const cartItems = await prisma.cartItem.findMany({
        where: {
          cartId: cart?.id,
        },
        include: {
          product: true,
        },
      });

      res.send(cartItems);
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: "Internal server error" });
    }
  });

  app.delete(
    "/person/cart/:id/delete",
    { preHandler: [validateJwt] },
    async (req: any, res) => {
      const { id } = req.params;
      try {
        const cart = await prisma.cart.findFirst({
          where: {
            userId: req.user.id,
          },
        });

        const cartItem = await prisma.cartItem.delete({
          where: {
            id: id,
          },
        });
        res.send(cartItem);
      } catch (error) {
        res.status(500).send({ error: "Internal server error" });
      }
    }
  );

  app.post(
    "/person/cart/:id/store",
    { preHandler: [validateJwt] },
    async (req: any, res) => {
      const productId = req.params.id;
      const userId = req.user.id;

      try {
        const userCart = await prisma.cart.findFirst({
          where: {
            userId,
          },
        });

        if (!userCart) {
          return res.status(409).send({ error: "User cart not found" });
        }

        const productIsAlreadyInCart = await prisma.cartItem.findFirst({
          where: {
            cartId: userCart.id,
            productId,
          },
        });

        if (productIsAlreadyInCart) {
          return res.status(409).send({ error: "Product already in cart" });
        }

        const newCartItem = await prisma.cartItem.create({
          data: {
            quantity: 1,
            cartId: userCart.id,
            productId,
          },
        });

        return res.send(newCartItem);
      } catch (error) {
        return res.status(500).send({ error: "Error adding item to cart" });
      }
    }
  );

  app.get("/file/:id/show", async (req: any, res) => {
    const id = req.params;

    try {
      const product = await prisma.product.findUnique({
        where: {
          id: id,
        },
      });

      if (!product) {
        return res
          .status(404)
          .send({ message: `Product with id ${id} was not found` });
      }

      const data = fs.readFileSync(
        join(
          `C:\Users\guizi\OneDrive\Área de Trabalho\projects\snkr-shop\images`,
          product?.attachmentEquip
        )
      );

      return res.send(data);
    } catch (error) {
      return res.status(500).send({ error: "Error searching equipment" });
    }
  });
}
