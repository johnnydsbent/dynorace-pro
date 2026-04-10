import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCarSchema, insertRaceSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get("/api/cars", async (_req, res) => {
    try {
      const cars = await storage.getCars();
      res.json(cars);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch cars" });
    }
  });

  app.get("/api/cars/:id", async (req, res) => {
    try {
      const car = await storage.getCar(req.params.id);
      if (!car) {
        return res.status(404).json({ error: "Car not found" });
      }
      res.json(car);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch car" });
    }
  });

  app.post("/api/cars", async (req, res) => {
    try {
      const parsed = insertCarSchema.parse(req.body);
      const car = await storage.createCar(parsed);
      res.status(201).json(car);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create car" });
    }
  });

  app.patch("/api/cars/:id", async (req, res) => {
    try {
      const parsed = insertCarSchema.partial().parse(req.body);
      const car = await storage.updateCar(req.params.id, parsed);
      if (!car) {
        return res.status(404).json({ error: "Car not found" });
      }
      res.json(car);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update car" });
    }
  });

  app.delete("/api/cars/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteCar(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Car not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete car" });
    }
  });

  app.get("/api/races", async (_req, res) => {
    try {
      const races = await storage.getRaces();
      res.json(races);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch races" });
    }
  });

  app.get("/api/races/:id", async (req, res) => {
    try {
      const race = await storage.getRace(req.params.id);
      if (!race) {
        return res.status(404).json({ error: "Race not found" });
      }
      res.json(race);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch race" });
    }
  });

  app.post("/api/races", async (req, res) => {
    try {
      const parsed = insertRaceSchema.parse(req.body);
      const race = await storage.createRace(parsed);
      res.status(201).json(race);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create race" });
    }
  });

  app.post("/api/races/:id/simulate", async (req, res) => {
    try {
      const race = await storage.simulateRace(req.params.id);
      if (!race) {
        return res.status(404).json({ error: "Race not found" });
      }
      res.json(race);
    } catch (error) {
      res.status(500).json({ error: "Failed to simulate race" });
    }
  });

  app.patch("/api/races/:id", async (req, res) => {
    try {
      const race = await storage.updateRace(req.params.id, req.body);
      if (!race) {
        return res.status(404).json({ error: "Race not found" });
      }
      res.json(race);
    } catch (error) {
      res.status(500).json({ error: "Failed to update race" });
    }
  });

  return httpServer;
}
