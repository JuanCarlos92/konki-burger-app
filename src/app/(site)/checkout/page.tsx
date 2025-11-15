
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAppContext } from "@/lib/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";

/**
 * Esquema de validación para el formulario de checkout usando Zod.
 * Define los campos requeridos (`name`, `email`, `address`) y sus respectivas validaciones.
 */
const formSchema = z.object({
  name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
  email: z.string().email({ message: "Por favor, introduce un email válido." }),
  address: z.string().min(10, { message: "La dirección debe tener al menos 10 caracteres." }),
});

/**
 * Página de Checkout.
 * Permite al usuario revisar los artículos de su carrito, introducir sus datos personales
 * y finalizar la compra.
 */
export default function CheckoutPage() {
  // Hooks para acceder al contexto global (carrito, usuario), al router de Next.js y a las notificaciones.
  const { cart, cartTotal, addOrder, clearCart, currentUser } = useAppContext();
  const router = useRouter();
  const { toast } = useToast();

  // Configuración del formulario con `react-hook-form` y `zod` para la validación.
  // Los valores por defecto del formulario se rellenan automáticamente con los datos
  // del usuario actual si está autenticado.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: currentUser?.name || "",
      email: currentUser?.email || "",
      address: currentUser?.address || "",
    },
  });

  /**
   * Función que se ejecuta al enviar el formulario.
   * Procesa el pedido, limpia el carrito y redirige al usuario a la página de inicio.
   * @param {object} values - Los datos del formulario ya validados por Zod.
   */
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Llama a la función del contexto para crear el pedido con los datos del cliente.
    addOrder({ customer: values });
    // Limpia el carrito después de realizar el pedido.
    clearCart();
    // Muestra una notificación de éxito al usuario.
    toast({
      title: "¡Pedido Realizado!",
      description: "Tu deliciosa comida se está preparando. ¡Te avisaremos cuando esté lista!",
    });
    // Redirige al usuario a la página de inicio.
    router.push("/");
  }

  // Si el carrito está vacío, no se muestra el formulario de checkout.
  // En su lugar, se muestra un mensaje informativo y un botón para volver al menú.
  if (cart.length === 0) {
    return (
        <div className="container py-12 text-center">
            <h1 className="font-headline text-4xl mb-4">Tu Carrito está Vacío</h1>
            <p className="text-muted-foreground mb-6">No puedes pagar con un carrito vacío. ¡Vamos a encontrar algo sabroso!</p>
            <Button asChild>
                <a href="/">Volver al Menú</a>
            </Button>
        </div>
    )
  }

  // Renderiza la página de checkout con el formulario y el resumen del pedido.
  return (
    <div className="container py-12 mx-auto">
      <h1 className="text-4xl font-bold font-headline text-center mb-8">Finalizar Compra</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Columna del formulario de datos del cliente */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Tus Datos</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Campo para el nombre completo */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre Completo</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Campo para el email */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="tu@ejemplo.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Campo para la dirección */}
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dirección para Recogida/Envío</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Calle Cósmica, Ciudad Galaxia" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Botón de envío del formulario, que también muestra el total del carrito */}
                  <Button type="submit" className="w-full mt-6" size="lg" style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))'}}>
                    Realizar Pedido - ${cartTotal.toFixed(2)}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Columna del resumen del pedido */}
        <div>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Resumen del Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Itera sobre los artículos del carrito para mostrarlos */}
                    {cart.map(item => (
                        <div key={item.product.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                               <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
                                    {item.product.imageUrl && (
                                        <Image src={item.product.imageUrl} alt={item.product.name} fill className="object-cover" />
                                    )}
                               </div>
                               <div>
                                   <p className="font-semibold">{item.product.name}</p>
                                   <p className="text-sm text-muted-foreground">Cantidad: {item.quantity}</p>
                               </div>
                            </div>
                            <p className="font-semibold">${(item.product.price * item.quantity).toFixed(2)}</p>
                        </div>
                    ))}
                    <Separator />
                </CardContent>
                <CardFooter className="flex justify-between font-bold text-xl">
                    <p>Total</p>
                    <p>${cartTotal.toFixed(2)}</p>
                </CardFooter>
            </Card>
        </div>
      </div>
    </div>
  );
}
