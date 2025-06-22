# Configuración de MercadoPago

## Pasos para configurar MercadoPago en la aplicación

### 1. Crear cuenta en MercadoPago

1. Ve a [MercadoPago Developers](https://www.mercadopago.com.ar/developers)
2. Crea una cuenta o inicia sesión
3. Accede al [Panel de Desarrolladores](https://www.mercadopago.com.ar/developers/panel)

### 2. Obtener las credenciales

#### Para pruebas (Sandbox):
1. En el panel de desarrolladores, ve a "Tus integraciones"
2. Selecciona "Credenciales"
3. Copia las credenciales de **Test**:
   - **Public Key**: `TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
   - **Access Token**: `TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

#### Para producción:
1. Una vez que hayas probado todo en sandbox, solicita la aprobación de tu cuenta
2. Obtén las credenciales de **Producción**:
   - **Public Key**: `APP-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
   - **Access Token**: `APP-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Firebase Configuration (ya configurado)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id

# MercadoPago Configuration
VITE_MERCADOPAGO_PUBLIC_KEY=TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
VITE_MERCADOPAGO_ACCESS_TOKEN=TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### 4. Configurar URLs de retorno

En el panel de MercadoPago, configura las URLs de retorno:

#### URLs de éxito:
- **Test**: `http://localhost:5173/order-confirmation/{order_id}`
- **Producción**: `https://tudominio.com/order-confirmation/{order_id}`

#### URLs de fallo:
- **Test**: `http://localhost:5173/order-confirmation/{order_id}?status=failed`
- **Producción**: `https://tudominio.com/order-confirmation/{order_id}?status=failed`

#### URLs pendientes:
- **Test**: `http://localhost:5173/order-confirmation/{order_id}?status=pending`
- **Producción**: `https://tudominio.com/order-confirmation/{order_id}?status=pending`

### 5. Probar la integración

1. Inicia la aplicación en modo desarrollo:
   ```bash
   npm run dev
   ```

2. Ve al panel de administración y habilita MercadoPago como método de pago

3. Realiza una compra de prueba:
   - Agrega productos al carrito
   - Ve al checkout
   - Selecciona MercadoPago como método de pago
   - Completa el formulario
   - Serás redirigido a MercadoPago

4. En MercadoPago, usa las tarjetas de prueba:
   - **Visa**: 4509 9535 6623 3704
   - **Mastercard**: 5031 4332 1540 6351
   - **Cualquier fecha futura**
   - **Cualquier CVV de 3 dígitos**

### 6. Monitorear pagos

Puedes monitorear los pagos en:
- **Test**: [Panel de Sandbox](https://www.mercadopago.com.ar/developers/panel/credentials)
- **Producción**: [Panel de MercadoPago](https://www.mercadopago.com.ar/activities)

### 7. Webhooks (Opcional)

Para recibir notificaciones automáticas de cambios de estado:

1. En el panel de MercadoPago, configura la URL de webhook:
   - **Test**: `https://tu-backend.com/webhooks/mercadopago`
   - **Producción**: `https://tu-backend.com/webhooks/mercadopago`

2. Implementa el endpoint en tu backend para procesar las notificaciones

### 8. Cambiar a producción

Cuando estés listo para producción:

1. Cambia las credenciales en el archivo `.env`:
   ```env
   VITE_MERCADOPAGO_PUBLIC_KEY=APP-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   VITE_MERCADOPAGO_ACCESS_TOKEN=APP-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   ```

2. Actualiza las URLs de retorno en el panel de MercadoPago

3. Solicita la aprobación de tu cuenta comercial

### Notas importantes

- **Nunca** compartas tus credenciales de producción
- Siempre prueba primero en sandbox
- Los pagos en sandbox no generan transacciones reales
- MercadoPago cobra una comisión por transacción (varía según el país)
- Mantén actualizada la documentación de MercadoPago para cambios en la API

### Soporte

Si tienes problemas:
1. Revisa la [documentación oficial de MercadoPago](https://www.mercadopago.com.ar/developers/docs)
2. Consulta los logs de la consola del navegador
3. Verifica que las credenciales sean correctas
4. Asegúrate de que las URLs de retorno estén configuradas correctamente 