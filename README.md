# Konki Burger

Bienvenido al repositorio de **Konki Burger**, una aplicación web completa para la gestión de un restaurante de hamburguesas, construida con tecnologías modernas y desplegada en la nube con Firebase.

Esta aplicación ofrece una experiencia fluida tanto para los clientes que desean pedir comida como para los administradores que gestionan el negocio.

## Características Principales

### Portal del Cliente

-   **Menú Interactivo:** Los usuarios pueden explorar el catálogo completo de productos, incluyendo hamburguesas, acompañamientos y bebidas.
-   **Filtrado por Categorías:** Filtra fácilmente los productos por categorías para encontrar rápidamente lo que buscas.
-   **Carrito de Compras Persistente:**
    -   Los usuarios autenticados tienen su carrito guardado en la nube (Firestore), sincronizado entre dispositivos.
    -   Los usuarios invitados tienen un carrito persistente en su navegador (`localStorage`).
-   **Gestión del Carrito:** Añade, elimina y actualiza la cantidad de productos en un panel lateral sin interrumpir la navegación.
-   **Proceso de Checkout Simplificado:** Un formulario de pago claro que se rellena automáticamente si el usuario ha iniciado sesión.
-   **Autenticación de Usuarios Segura:**
    -   **Registro y Creación de Cuentas:** Los nuevos usuarios pueden crear una cuenta proporcionando su nombre, email, dirección y contraseña.
    -   **Inicio de Sesión Seguro:** Acceso a cuentas existentes.
    -   **Gestión de Contraseñas:** Las contraseñas son gestionadas de forma segura y automática por **Firebase Authentication**. En ningún momento se almacenan contraseñas en texto plano. Firebase se encarga de todo el proceso de hashing y salting, garantizando que ni siquiera el administrador de la base de datos tenga acceso a ellas. En la base de datos (Firestore) solo se guarda la información del perfil del usuario (nombre, email, dirección), no sus credenciales de acceso.
    -   **Pedidos como Invitado:** Posibilidad de realizar pedidos sin necesidad de una cuenta.

### Panel de Administración (Ruta Protegida)

-   **Dashboard Central:** Un panel de control que muestra estadísticas clave de un vistazo: pedidos pendientes, número total de productos y usuarios registrados.
-   **Gestión de Pedidos:**
    -   Visualiza todos los pedidos de los clientes en una tabla organizada.
    -   Acepta o rechaza pedidos pendientes, estableciendo una hora de recogida.
-   **Gestión de Productos:** Un CRUD (Crear, Leer, Actualizar, Eliminar) completo para los productos del menú. Añade nuevas hamburguesas, edita precios o elimina artículos del catálogo.
-   **Gestión de Usuarios:** Visualiza la lista de todos los usuarios registrados en el sistema.

## Tecnologías Utilizadas

Este proyecto integra un stack tecnológico moderno centrado en la eficiencia, la escalabilidad y una excelente experiencia de desarrollador.

-   **Framework:** **Next.js** (usando el App Router) para renderizado del lado del servidor (SSR) y generación de sitios estáticos (SSG).
-   **Librería UI:** **React** para construir una interfaz de usuario dinámica y reactiva.
-   **Lenguaje:** **TypeScript** para un código más seguro, mantenible y robusto.
-   **Estilos:**
    -   **Tailwind CSS** para un diseño rápido y personalizable basado en utilidades.
    -   **ShadCN UI** para una colección de componentes de UI accesibles y reutilizables.
-   **Iconos:** **Lucide React** para un conjunto de iconos limpio y consistente.
-   **Gestión de Formularios:** **React Hook Form** para formularios performantes y **Zod** para una validación de esquemas robusta.
-   **Gestión de Estado:** **React Context API** para una gestión de estado global y centralizada (carrito de compras, autenticación, etc.).

### Backend y Despliegue (Firebase)

-   **Base de Datos:** **Firestore** (base de datos NoSQL) para almacenar toda la información de productos, perfiles de usuario y pedidos.
-   **Autenticación:** **Firebase Authentication** para gestionar de forma segura todo el ciclo de vida de los usuarios: registro, inicio de sesión, cierre de sesión y restablecimiento de contraseñas. Se encarga de almacenar y verificar las credenciales de forma segura sin exponerlas en la base de datos.
-   **Hosting:** **Firebase App Hosting** para un despliegue continuo, escalable y seguro.
-   **Gestión de Secretos:** **Secret Manager** (integrado con Firebase) para almacenar de forma segura las credenciales.
-   **Reglas de Seguridad:** Reglas de **Firestore Security Rules** para proteger la base de datos y definir los permisos de acceso de cada usuario.

## Autor

Este proyecto fue realizado por **Juan Carlos Filter Martín**.

## Licencia

Este proyecto está bajo la Licencia CC0-1.0 license. Consulta el archivo `LICENSE` para más detalles.
