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

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  address: z.string().min(10, { message: "Address must be at least 10 characters." }),
});

export default function CheckoutPage() {
  const { cart, cartTotal, addOrder, clearCart, currentUser } = useAppContext();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: currentUser?.name || "",
      email: currentUser?.email || "",
      address: currentUser?.address || "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    addOrder({ customer: values });
    clearCart();
    toast({
      title: "Order Placed! 🚀",
      description: "Your delicious meal is being prepared. We'll notify you when it's ready!",
    });
    router.push("/");
  }

  if (cart.length === 0) {
    return (
        <div className="container py-12 text-center">
            <h1 className="font-headline text-4xl mb-4">Your Cart is Empty</h1>
            <p className="text-muted-foreground mb-6">You can't check out with an empty cart. Let's find something tasty!</p>
            <Button asChild>
                <a href="/">Back to Menu</a>
            </Button>
        </div>
    )
  }

  return (
    <div className="container py-12">
      <h1 className="text-4xl font-bold font-headline text-center mb-8">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Your Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
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
                          <Input placeholder="you@example.com" {...field} />
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
                        <FormLabel>Address for Pickup/Delivery</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Cosmic Way, Galaxy Town" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full mt-6" size="lg" style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))'}}>
                    Place Order - ${cartTotal.toFixed(2)}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {cart.map(item => (
                        <div key={item.product.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                               <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
                                    <Image src={item.product.image.src} alt={item.product.image.alt} fill className="object-cover" />
                               </div>
                               <div>
                                   <p className="font-semibold">{item.product.name}</p>
                                   <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
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
