import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCarSchema, type Car, type InsertCar, type Drivetrain } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Car as CarIcon, Plus, Pencil, Trash2, Gauge, Weight, 
  Settings, ArrowLeft, Palette, Loader2 
} from "lucide-react";
import { useRace } from "@/lib/race-context";

function CarCard({ car, onEdit, onDelete }: { 
  car: Car; 
  onEdit: (car: Car) => void;
  onDelete: (car: Car) => void;
}) {
  const powerToWeight = (car.horsepower / (car.weight / 1000)).toFixed(1);
  
  return (
    <Card className="hover-elevate" data-testid={`card-car-${car.id}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div 
            className="w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: car.color + "20" }}
          >
            <CarIcon className="w-8 h-8" style={{ color: car.color }} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="font-display font-bold text-lg truncate">{car.name}</h3>
              <Badge variant="outline" className="text-xs" style={{ borderColor: car.color, color: car.color }}>
                {car.drivetrain}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground truncate">{car.makeModel}</p>
            
            <div className="flex items-center gap-4 mt-3 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">{car.horsepower} HP</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Weight className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">{car.weight.toLocaleString()} lbs</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Settings className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">{powerToWeight} HP/ton</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onEdit(car)}
              data-testid={`button-edit-car-${car.id}`}
            >
              <Pencil className="w-4 h-4" />
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-destructive"
                  data-testid={`button-delete-car-${car.id}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete {car.name}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently remove this car from your garage. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => onDelete(car)}
                    className="bg-destructive text-destructive-foreground"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface CarFormProps {
  car?: Car;
  onSubmit: (data: InsertCar) => void;
  onCancel: () => void;
  isPending: boolean;
}

function CarForm({ car, onSubmit, onCancel, isPending }: CarFormProps) {
  const form = useForm<InsertCar>({
    resolver: zodResolver(insertCarSchema),
    defaultValues: car ? {
      name: car.name,
      makeModel: car.makeModel,
      horsepower: car.horsepower,
      weight: car.weight,
      color: car.color,
      drivetrain: car.drivetrain,
    } : {
      name: "",
      makeModel: "",
      horsepower: 400,
      weight: 3500,
      color: "#ef4444",
      drivetrain: "RWD" as Drivetrain,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Car Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., My Mustang" {...field} data-testid="input-car-name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="makeModel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Make / Model</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 2024 Ford Mustang GT" {...field} data-testid="input-car-makemodel" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="drivetrain"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Drivetrain</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger data-testid="select-drivetrain">
                    <SelectValue placeholder="Select drivetrain" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="RWD">RWD (Rear Wheel Drive)</SelectItem>
                  <SelectItem value="FWD">FWD (Front Wheel Drive)</SelectItem>
                  <SelectItem value="AWD">AWD (All Wheel Drive)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="horsepower"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Horsepower: {field.value} HP</FormLabel>
              <FormControl>
                <Slider
                  value={[field.value]}
                  onValueChange={([val]) => field.onChange(val)}
                  min={50}
                  max={2000}
                  step={10}
                  data-testid="slider-horsepower"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="weight"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Weight: {field.value.toLocaleString()} lbs</FormLabel>
              <FormControl>
                <Slider
                  value={[field.value]}
                  onValueChange={([val]) => field.onChange(val)}
                  min={1500}
                  max={6000}
                  step={50}
                  data-testid="slider-weight"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Car Color
              </FormLabel>
              <FormControl>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    className="w-12 h-10 rounded-lg cursor-pointer border border-border"
                    data-testid="input-car-color"
                  />
                  <Input 
                    value={field.value} 
                    onChange={(e) => field.onChange(e.target.value)}
                    className="font-mono uppercase"
                    maxLength={7}
                    data-testid="input-car-color-hex"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} data-testid="button-cancel">
            Cancel
          </Button>
          <Button type="submit" disabled={isPending} data-testid="button-save-car">
            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {car ? "Save Changes" : "Add Car"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function Garage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { refreshCars } = useRace();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);

  const { data: cars = [], isLoading } = useQuery<Car[]>({
    queryKey: ["/api/cars"],
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertCar) => apiRequest("POST", "/api/cars", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cars"] });
      refreshCars();
      setDialogOpen(false);
      toast({ title: "Car added to garage" });
    },
    onError: () => {
      toast({ title: "Failed to add car", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertCar> }) => 
      apiRequest("PATCH", `/api/cars/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cars"] });
      refreshCars();
      setDialogOpen(false);
      setEditingCar(null);
      toast({ title: "Car updated" });
    },
    onError: () => {
      toast({ title: "Failed to update car", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/cars/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cars"] });
      refreshCars();
      toast({ title: "Car removed from garage" });
    },
    onError: () => {
      toast({ title: "Failed to delete car", variant: "destructive" });
    },
  });

  const handleEdit = (car: Car) => {
    setEditingCar(car);
    setDialogOpen(true);
  };

  const handleDelete = (car: Car) => {
    deleteMutation.mutate(car.id);
  };

  const handleSubmit = (data: InsertCar) => {
    if (editingCar) {
      updateMutation.mutate({ id: editingCar.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingCar(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setLocation("/")}
              data-testid="button-back-home"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-display font-bold">Garage</h1>
              <p className="text-muted-foreground">Manage your car collection</p>
            </div>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) setEditingCar(null);
          }}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-car">
                <Plus className="w-4 h-4 mr-2" />
                Add Car
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingCar ? "Edit Car" : "Add New Car"}</DialogTitle>
                <DialogDescription>
                  {editingCar ? "Update your car's specifications" : "Add a new car to your garage"}
                </DialogDescription>
              </DialogHeader>
              <CarForm
                car={editingCar || undefined}
                onSubmit={handleSubmit}
                onCancel={handleDialogClose}
                isPending={createMutation.isPending || updateMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : cars.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CarIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <CardTitle className="mb-2">No cars in garage</CardTitle>
              <CardDescription className="mb-6">
                Add your first car to start racing
              </CardDescription>
              <Button onClick={() => setDialogOpen(true)} data-testid="button-add-first-car">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Car
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {cars.map((car) => (
              <CarCard
                key={car.id}
                car={car}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        <Card className="mt-8">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="text-sm text-muted-foreground">
                {cars.length} car{cars.length !== 1 ? "s" : ""} in garage
              </div>
              <Button 
                variant="outline" 
                onClick={() => setLocation("/")}
                data-testid="button-start-racing"
              >
                Start Racing
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
