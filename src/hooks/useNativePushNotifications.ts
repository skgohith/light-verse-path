 import { useState, useEffect, useCallback } from 'react';
 import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
 import { Capacitor } from '@capacitor/core';
 
 interface NativePushSettings {
   enabled: boolean;
   token: string | null;
 }
 
 export function useNativePushNotifications() {
   const [settings, setSettings] = useState<NativePushSettings>({
     enabled: false,
     token: null,
   });
   const [isNative, setIsNative] = useState(false);
 
   useEffect(() => {
     // Check if running on native platform
     const platform = Capacitor.getPlatform();
     setIsNative(platform === 'ios' || platform === 'android');
 
     // Load saved settings
     const saved = localStorage.getItem('native_push_settings');
     if (saved) {
       setSettings(JSON.parse(saved));
     }
   }, []);
 
   useEffect(() => {
     localStorage.setItem('native_push_settings', JSON.stringify(settings));
   }, [settings]);
 
   const requestPermission = useCallback(async () => {
     if (!isNative) {
       console.log('Push notifications only work on native platforms');
       return false;
     }
 
     try {
       const permStatus = await PushNotifications.checkPermissions();
       
       if (permStatus.receive === 'prompt') {
         const result = await PushNotifications.requestPermissions();
         if (result.receive !== 'granted') {
           console.log('Push notification permission denied');
           return false;
         }
       } else if (permStatus.receive !== 'granted') {
         console.log('Push notification permission not granted');
         return false;
       }
 
       await PushNotifications.register();
       return true;
     } catch (error) {
       console.error('Error requesting push permission:', error);
       return false;
     }
   }, [isNative]);
 
   const enableNotifications = useCallback(async () => {
     const granted = await requestPermission();
     if (granted) {
       setSettings(prev => ({ ...prev, enabled: true }));
     }
     return granted;
   }, [requestPermission]);
 
   const disableNotifications = useCallback(() => {
     setSettings(prev => ({ ...prev, enabled: false, token: null }));
   }, []);
 
   useEffect(() => {
     if (!isNative) return;
 
     // Handle registration success
     const registrationListener = PushNotifications.addListener('registration', (token: Token) => {
       console.log('Push registration success, token:', token.value);
       setSettings(prev => ({ ...prev, token: token.value }));
     });
 
     // Handle registration error
     const registrationErrorListener = PushNotifications.addListener('registrationError', (error) => {
       console.error('Push registration error:', error);
     });
 
     // Handle incoming notifications when app is in foreground
     const notificationReceivedListener = PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
       console.log('Push notification received:', notification);
     });
 
     // Handle notification action (when user taps notification)
     const notificationActionListener = PushNotifications.addListener('pushNotificationActionPerformed', (action: ActionPerformed) => {
       console.log('Push notification action performed:', action);
     });
 
     return () => {
       registrationListener.then(l => l.remove());
       registrationErrorListener.then(l => l.remove());
       notificationReceivedListener.then(l => l.remove());
       notificationActionListener.then(l => l.remove());
     };
   }, [isNative]);
 
   return {
     settings,
     isNative,
     enableNotifications,
     disableNotifications,
     requestPermission,
   };
 }