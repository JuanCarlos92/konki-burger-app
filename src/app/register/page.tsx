"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from "@/lib/contexts/AppContext";
import { errorEmitter } from "@/firebase";

/**
 * Esquema de validación para el formulario de registro.
 */
const formSchema = z.object({
  name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
  email: z.string().email({ message: "Por favor, introduce un email válido." }),
  address: z.string().min(10, { message: "La dirección debe tener al menos 10 caracteres." }),
  password: z.string().min(8, { message: "La contraseña debe tener al menos 8 caracteres." }),
});

/**
 * Página de registro de nuevos usuarios.
 */
export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { register } = useAppContext();

  // Configuración del formulario con react-hook-form y Zod.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", address: "", password: "" },
  });

  /**
   * Maneja el envío del formulario de registro.
   * @param {object} values - Los valores validados del formulario.
   */
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    register(values.name, values.email, values.address, values.password)
      .then(() => {
        // Si el registro es exitoso, muestra una notificación y redirige al inicio.
        toast({
          title: "¡Cuenta Creada!",
          description: `¡Bienvenido a Konki Burger, ${values.name}!`,
        });
        router.push("/");
      })
      .catch((error: any) => {
        // Si hay un error (ej. el email ya existe), se emite un error global
        // para que pueda ser capturado y mostrado en la superposición de desarrollo.
        errorEmitter.emit('permission-error', error);
      });
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <Link href="/" className="mb-4 inline-block">
                <Menu className="h-10 w-10 text-primary mx-auto" />
            </Link>
          <CardTitle className="text-3xl font-headline">Crear una Cuenta</CardTitle>
          <CardDescription>¡Únete a la familia Konki Burger!</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="m@ejemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dirección</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Calle Cósmica" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                Crear Cuenta
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/login" className="underline text-primary">
              Inicia sesión
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
