import { Injectable } from '@nestjs/common';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

export interface EmailTemplateData {
  subject: string;
  title: string;
  subtitle?: string;
  greeting?: string;
  message?: string;
  highlightBox?: {
    title: string;
    items: Array<{
      label: string;
      value: string;
    }>;
  };
  ctaButton?: {
    text: string;
    url: string;
  };
  additionalInfo?: string;
}

@Injectable()
export class TemplateService {
  private baseTemplate: HandlebarsTemplateDelegate<any>;

  constructor() {
    this.loadTemplates();
  }

  private loadTemplates() {
    try {
      // Essayer d'abord le template moderne, sinon utiliser le template de base
      let templatePath = path.join(__dirname, 'templates', 'modern.hbs');
      if (!fs.existsSync(templatePath)) {
        templatePath = path.join(__dirname, 'templates', 'base.hbs');
      }
      
      // Si aucun template n'est trouvé, utiliser un template de fallback
      if (!fs.existsSync(templatePath)) {
        console.warn('Aucun template trouvé, utilisation du template de fallback');
        this.baseTemplate = this.createFallbackTemplate();
        return;
      }
      
      const templateContent = fs.readFileSync(templatePath, 'utf-8');
      this.baseTemplate = handlebars.compile(templateContent);
    } catch (error) {
      console.error('Erreur lors du chargement des templates:', error);
      console.warn('Utilisation du template de fallback');
      this.baseTemplate = this.createFallbackTemplate();
    }
  }

  private createFallbackTemplate(): HandlebarsTemplateDelegate<any> {
    const fallbackTemplate = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{subject}}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .content { background: white; padding: 20px; border-radius: 8px; }
        .button { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 4px; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{title}}</h1>
            {{#if subtitle}}<p>{{subtitle}}</p>{{/if}}
        </div>
        <div class="content">
            {{#if greeting}}<p>{{greeting}}</p>{{/if}}
            {{#if message}}{{{message}}}{{/if}}
            {{#if ctaButton}}
            <p style="text-align: center; margin: 30px 0;">
                <a href="{{ctaButton.url}}" class="button">{{ctaButton.text}}</a>
            </p>
            {{/if}}
            {{#if additionalInfo}}{{{additionalInfo}}}{{/if}}
        </div>
        <div class="footer">
            <p>Cet email a été envoyé par Dental E-commerce</p>
        </div>
    </div>
</body>
</html>`;
    
    return handlebars.compile(fallbackTemplate);
  }

  renderEmail(data: EmailTemplateData): string {
    try {
      return this.baseTemplate(data);
    } catch (error) {
      console.error('Erreur lors du rendu du template:', error);
      throw new Error('Erreur lors du rendu du template d\'email');
    }
  }

  // Template pour l'email de bienvenue
  renderWelcomeEmail(firstName: string): string {
    return this.renderEmail({
      subject: 'Bienvenue sur Dental E-commerce',
      title: 'Bienvenue !',
      subtitle: 'Votre compte a été créé avec succès',
      greeting: `Bonjour ${firstName},`,
      message: `
        <p>Nous sommes ravis de vous accueillir sur Dental E-commerce, votre partenaire de confiance pour les équipements dentaires.</p>
        <p>Votre compte a été créé avec succès et vous pouvez dès maintenant :</p>
        <ul style="margin: 20px 0; padding-left: 20px;">
          <li>Parcourir notre catalogue de produits</li>
          <li>Ajouter des articles à votre panier</li>
          <li>Suivre vos commandes</li>
          <li>Gérer votre liste de souhaits</li>
        </ul>
      `,
      ctaButton: {
        text: 'Commencer mes achats',
        url: 'http://localhost:3001/products'
      },
      additionalInfo: `
        <p><strong>Besoin d'aide ?</strong></p>
        <p>Notre équipe support est disponible pour vous accompagner dans vos achats. N'hésitez pas à nous contacter.</p>
      `
    });
  }

  // Template pour l'email de réinitialisation de mot de passe
  renderPasswordResetEmail(firstName: string, resetUrl: string): string {
    return this.renderEmail({
      subject: 'Réinitialisation de votre mot de passe',
      title: 'Réinitialisation de mot de passe',
      subtitle: 'Vous avez demandé la réinitialisation de votre mot de passe',
      greeting: `Bonjour ${firstName},`,
      message: `
        <p>Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte Dental E-commerce.</p>
        <p>Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email en toute sécurité.</p>
      `,
      highlightBox: {
        title: 'Informations importantes',
        items: [
          { label: 'Lien valide pendant', value: '1 heure' },
          { label: 'Sécurité', value: 'Lien unique et sécurisé' }
        ]
      },
      ctaButton: {
        text: 'Réinitialiser mon mot de passe',
        url: resetUrl
      },
      additionalInfo: `
        <p><strong>Sécurité :</strong></p>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>Ne partagez jamais ce lien</li>
          <li>Le lien expire automatiquement</li>
          <li>Utilisez un mot de passe fort</li>
        </ul>
      `
    });
  }

  // Template pour l'email de confirmation de commande
  renderOrderConfirmationEmail(firstName: string, orderData: any): string {
    return this.renderEmail({
      subject: `Confirmation de commande #${orderData.orderNumber}`,
      title: 'Commande confirmée !',
      subtitle: `Votre commande #${orderData.orderNumber} a été confirmée`,
      greeting: `Bonjour ${firstName},`,
      message: `
        <p>Nous avons bien reçu votre commande et nous vous remercions pour votre confiance.</p>
        <p>Votre commande est en cours de traitement et vous recevrez des mises à jour sur son statut.</p>
      `,
      highlightBox: {
        title: 'Détails de la commande',
        items: [
          { label: 'Numéro de commande', value: orderData.orderNumber },
          { label: 'Date de commande', value: orderData.orderDate },
          { label: 'Total', value: `${orderData.total} €` },
          { label: 'Statut', value: 'En cours de traitement' }
        ]
      },
      ctaButton: {
        text: 'Voir ma commande',
        url: `http://localhost:3001/orders/${orderData.id}`
      },
      additionalInfo: `
        <p><strong>Prochaines étapes :</strong></p>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>Préparation de votre commande</li>
          <li>Expédition sous 24-48h</li>
          <li>Suivi en temps réel</li>
        </ul>
      `
    });
  }

  // Template pour l'email de notification d'expédition
  renderShippingNotificationEmail(firstName: string, orderData: any, trackingInfo: any): string {
    return this.renderEmail({
      subject: `Votre commande #${orderData.orderNumber} a été expédiée`,
      title: 'Commande expédiée !',
      subtitle: 'Votre commande est en route vers vous',
      greeting: `Bonjour ${firstName},`,
      message: `
        <p>Excellente nouvelle ! Votre commande a été préparée et expédiée.</p>
        <p>Vous pouvez suivre votre colis en temps réel grâce aux informations ci-dessous.</p>
      `,
      highlightBox: {
        title: 'Informations d\'expédition',
        items: [
          { label: 'Numéro de commande', value: orderData.orderNumber },
          { label: 'Transporteur', value: trackingInfo.carrier },
          { label: 'Numéro de suivi', value: trackingInfo.trackingNumber },
          { label: 'Date d\'expédition', value: trackingInfo.shippingDate }
        ]
      },
      ctaButton: {
        text: 'Suivre mon colis',
        url: trackingInfo.trackingUrl
      },
      additionalInfo: `
        <p><strong>Livraison estimée :</strong> ${trackingInfo.estimatedDelivery}</p>
        <p>Vous recevrez une notification dès la livraison de votre commande.</p>
      `
    });
  }

  // Template pour l'email de réinitialisation de mot de passe réussie
  renderPasswordResetSuccessEmail(firstName: string): string {
    return this.renderEmail({
      subject: 'Mot de passe mis à jour avec succès',
      title: 'Mot de passe mis à jour !',
      subtitle: 'Votre mot de passe a été modifié avec succès',
      greeting: `Bonjour ${firstName},`,
      message: `
        <p>Nous confirmons que votre mot de passe a été mis à jour avec succès.</p>
        <p>Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.</p>
      `,
      ctaButton: {
        text: 'Se connecter',
        url: 'http://localhost:3001/login'
      },
      additionalInfo: `
        <p><strong>Sécurité :</strong></p>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>Gardez votre mot de passe confidentiel</li>
          <li>Utilisez un mot de passe unique</li>
          <li>Activez l'authentification à deux facteurs si disponible</li>
        </ul>
      `
    });
  }

  // Template pour l'email de changement de mot de passe
  renderPasswordChangeEmail(firstName: string): string {
    return this.renderEmail({
      subject: 'Votre mot de passe a été modifié',
      title: 'Mot de passe modifié !',
      subtitle: 'Nous confirmons la modification de votre mot de passe',
      greeting: `Bonjour ${firstName},`,
      message: `
        <p>Nous confirmons que votre mot de passe a été modifié avec succès.</p>
        <p>Cette modification a été effectuée depuis votre compte connecté.</p>
      `,
      highlightBox: {
        title: 'Informations de sécurité',
        items: [
          { label: 'Date de modification', value: new Date().toLocaleDateString('fr-FR') },
          { label: 'Heure de modification', value: new Date().toLocaleTimeString('fr-FR') },
          { label: 'IP de connexion', value: 'Votre appareil actuel' }
        ]
      },
      ctaButton: {
        text: 'Accéder à mon compte',
        url: 'http://localhost:3001/profile'
      },
      additionalInfo: `
        <p><strong>Si vous n'êtes pas à l'origine de cette modification :</strong></p>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>Contactez immédiatement notre support</li>
          <li>Vérifiez vos connexions récentes</li>
          <li>Activez l'authentification à deux facteurs</li>
        </ul>
      `
    });
  }

  // Template pour l'email de notification de commande à l'admin
  renderOrderNotificationToAdmin(orderData: any): string {
    return this.renderEmail({
      subject: `Nouvelle commande #${orderData.orderNumber}`,
      title: 'Nouvelle commande reçue !',
      subtitle: 'Une nouvelle commande nécessite votre attention',
      greeting: 'Bonjour,',
      message: `
        <p>Une nouvelle commande a été passée sur Dental E-commerce.</p>
        <p>Veuillez traiter cette commande dans les plus brefs délais.</p>
      `,
      highlightBox: {
        title: 'Détails de la commande',
        items: [
          { label: 'Numéro de commande', value: orderData.orderNumber },
          { label: 'Client', value: orderData.customerName },
          { label: 'Email', value: orderData.customerEmail },
          { label: 'Total', value: `${orderData.total} €` },
          { label: 'Méthode de paiement', value: orderData.paymentMethod },
          { label: 'Date de commande', value: orderData.orderDate }
        ]
      },
      ctaButton: {
        text: 'Voir la commande',
        url: `http://localhost:3000/admin/orders/${orderData.id}`
      },
      additionalInfo: `
        <p><strong>Actions requises :</strong></p>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>Vérifier le stock des produits</li>
          <li>Confirmer la commande</li>
          <li>Préparer l'expédition</li>
          <li>Mettre à jour le statut</li>
        </ul>
      `
    });
  }
} 