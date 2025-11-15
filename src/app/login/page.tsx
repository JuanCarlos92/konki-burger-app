"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Menu } from "lucide-react";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";

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
 * Esquema de validación para el formulario de inicio de sesión utilizando Zod.
 */
const formSchema = z.object({
  email: z.string().email({ message: "Por favor, introduce un email válido." }),
  password: z.string().min(1, { message: "La contraseña es obligatoria." }),
});

/**
 * Página de inicio de sesión.
 * Permite a los usuarios existentes acceder a su cuenta.
 */
export default function LoginPage() {
  const router = useRouter();
  const { login } = useAppContext();
  const { toast } = useToast();

  // Configuración del formulario con react-hook-form y el resolver de Zod.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  /**
   * Maneja el envío del formulario de inicio de sesión.
   * @param {object} values - Los valores del formulario (email y contraseña).
   */
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Llama a la función de login del contexto de la aplicación.
      await login(values.email, values.password);
      
      toast({
        title: "¡Sesión Iniciada!",
        description: `¡Bienvenido de nuevo!`,
      });

      // El layout de admin se encargará de redirigir a los administradores al panel.
      // Los usuarios normales irán a la página de inicio.
      router.push("/");

    } catch (error: any) {
      // Manejo de errores específicos de Firebase Auth.
      if (error.code === 'auth/invalid-credential') {
        toast({
            variant: "destructive",
            title: "Credenciales Inválidas",
            description: "Por favor, comprueba tu email y contraseña e inténtalo de nuevo.",
        });
      } else {
        // Para otros errores (p.ej., problemas de red), se emite un error global para depuración.
        const contextualError = new Error(`El inicio de sesión falló: ${error.message}`);
        errorEmitter.emit('permission-error', contextualError as any);
      }
    }
  };
  
  /**
   * Maneja la solicitud de restablecimiento de contraseña.
   * Envía un correo de Firebase Auth al email introducido en el formulario.
   */
  const handlePasswordReset = () => {
    const email = form.getValues("email");
    if (!email) {
      toast({
        variant: "destructive",
        title: "Email Requerido",
        description: "Por favor, introduce tu dirección de email para restablecer tu contraseña.",
      });
      return;
    }
    const auth = getAuth();
    sendPasswordResetEmail(auth, email)
        .then(() => {
            toast({
                title: "Email de Restablecimiento Enviado",
                description: `Se ha enviado un email a ${email} con instrucciones para restablecer tu contraseña.`,
            });
        })
        .catch((error) => {
            const contextualError = new Error(`El restablecimiento de contraseña falló: ${error.message}`);
            errorEmitter.emit('permission-error', contextualError as any);
        });
  };

  /**
   * Permite al usuario continuar como invitado, redirigiéndolo a la página de inicio.
   */
  const handleGuest = () => {
    router.push("/");
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <Link href="/" className="mb-4 inline-block">
                <Menu className="h-10 w-10 text-primary mx-auto" />
            </Link>
          <CardTitle className="text-3xl font-headline">Bienvenido de Nuevo</CardTitle>
          <CardDescription>Introduce tus credenciales para acceder a tu cuenta</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center">
                      <FormLabel>Contraseña</FormLabel>
                      <Button
                        type="button"
                        variant="link"
                        className="p-0 h-auto text-xs text-primary"
                        onClick={handlePasswordReset}
                      >
                        ¿Olvidaste tu contraseña?
                      </Button>
                    </div>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                Iniciar Sesión
              </Button>
               <Button type="button" variant="secondary" className="w-full" onClick={handleGuest}>
                Continuar como Invitado
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            ¿No tienes una cuenta?{" "}
            <Link href="/register" className="underline text-primary">
              Regístrate
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
