# Adding New Languages to HAYARCO

This guide will help you add new language support to the HAYARCO management system.

## Step-by-Step Guide

### 1. Create a New Language File

Create a new file in `src/locales/` directory. For example, to add French:

```javascript
// src/locales/fr.js
export const fr = {
    companyName: 'HAYARCO',
    tagline: 'Système de gestion avancé',
    email: 'Adresse e-mail',
    password: 'Mot de passe',
    login: 'Connexion',
    logout: 'Déconnexion',
    dashboard: 'Journal des dépenses',
    attendanceReport: 'Journal de présence',
    accounts: 'Comptes',
    departments: 'Départements',
    recordAttendance: 'Ma présence',
    notifications: 'Alertes système',
    clearAll: 'Tout effacer',
    noNotifications: 'Aucune notification actuellement',
    totalExpenses: 'Total des dépenses financières',
    totalOperations: 'Total des opérations',
    addNewOperation: 'Ajouter une nouvelle opération',
    department: 'Département',
    amount: 'Montant',
    details: 'Détails',
    saveOperation: 'Enregistrer l\'opération',
    detailedReport: 'Rapport détaillé des dépenses',
    exportExcel: 'Exporter Excel',
    print: 'Imprimer',
    date: 'Date',
    responsibleDept: 'Département responsable',
    description: 'Description / Détails',
    actions: 'Actions',
    employee: 'Employé',
    operation: 'Opération',
    time: 'Heure',
    gpsLocation: 'Emplacement (GPS)',
    attendance: 'Arrivée',
    departure: 'Départ',
    manageDepts: 'Gérer les départements',
    newDeptPlaceholder: 'Nom du nouveau département',
    add: 'Ajouter',
    workingNow: 'Vous êtes actuellement en service',
    outsideWork: 'Actuellement hors service',
    endWork: 'Fin du service',
    startWork: 'Début du service',
    geoTarget: 'Emplacement GPS pour la gestion',
    todayRecords: 'Enregistrements d\'aujourd\'hui',
    noRecordsToday: 'Aucun enregistrement pour aujourd\'hui',
    tipTitle: 'Conseil de gestion quotidien',
    tipText: 'Soyez attentif à enregistrer votre arrivée et départ à temps pour garantir des rapports précis.',
    currency: 'EGP',
    operationsCount: 'Ops',
    adminName: 'Directeur général',
    employeeName: 'Employé Kareem',
    confirmDelete: 'Êtes-vous sûr de vouloir supprimer cette opération?',
    financeNotif: 'Opération financière',
    attendanceNotif: 'Enregistrement de présence',
    loginNotif: 'Connexion utilisateur',
    logoutNotif: 'Déconnexion utilisateur',
    deleteNotif: 'Enregistrement supprimé'
};
```

### 2. Update the Index File

Add your new language to `src/locales/index.js`:

```javascript
import { ar } from './ar';
import { en } from './en';
import { fr } from './fr';  // Add this line

export const translations = {
    ar,
    en,
    fr  // Add this line
};
```

### 3. Update the Language Switcher (Optional)

If you want to add a language selector instead of just toggling between two languages, you'll need to modify the `App.jsx` file:

```javascript
// In App.jsx, replace the language toggle button with a dropdown:

<select 
    value={lang} 
    onChange={(e) => setLang(e.target.value)}
    style={{
        padding: '10px 15px',
        background: '#1e293b',
        border: '1px solid var(--primary)',
        borderRadius: '10px',
        color: 'white',
        cursor: 'pointer'
    }}
>
    <option value="ar">العربية</option>
    <option value="en">English</option>
    <option value="fr">Français</option>
</select>
```

### 4. Handle RTL/LTR Direction

Update the direction logic in `App.jsx`:

```javascript
// Current code:
const isRtl = lang === 'ar';

// Updated code for multiple languages:
const RTL_LANGUAGES = ['ar', 'he', 'fa']; // Add RTL languages here
const isRtl = RTL_LANGUAGES.includes(lang);
```

## Translation Keys Reference

Here's a complete list of all translation keys you need to provide:

| Key | Description | Example (English) |
|-----|-------------|-------------------|
| companyName | Company name | HAYARCO |
| tagline | Company tagline | Advanced Management System |
| email | Email label | Email Address |
| password | Password label | Password |
| login | Login button | Login |
| logout | Logout button | Logout |
| dashboard | Dashboard menu | Expense Log |
| attendanceReport | Attendance report menu | Attendance Log |
| accounts | Accounts menu | Accounts |
| departments | Departments menu | Departments |
| recordAttendance | Record attendance menu | My Attendance |
| notifications | Notifications title | System Alerts |
| clearAll | Clear all button | Clear All |
| noNotifications | No notifications message | No notifications currently |
| totalExpenses | Total expenses label | Total Financial Expenses |
| totalOperations | Total operations label | Total Operations |
| addNewOperation | Add operation button | Add New Operation |
| department | Department label | Department |
| amount | Amount label | Amount |
| details | Details label | Details |
| saveOperation | Save button | Save Operation |
| detailedReport | Report title | Detailed Expense Report |
| exportExcel | Export button | Export Excel |
| print | Print button | Print |
| date | Date label | Date |
| responsibleDept | Responsible department | Dept in Charge |
| description | Description label | Description / Details |
| actions | Actions column | Actions |
| employee | Employee label | Employee |
| operation | Operation label | Operation |
| time | Time label | Time |
| gpsLocation | GPS location label | Location (GPS) |
| attendance | Check-in label | Check-in |
| departure | Check-out label | Check-out |
| manageDepts | Manage departments title | Manage Departments |
| newDeptPlaceholder | New department placeholder | New Department Name |
| add | Add button | Add |
| workingNow | Working status | You are currently on shift |
| outsideWork | Off work status | Currently off shift |
| endWork | End work button | End Shift |
| startWork | Start work button | Start Shift |
| geoTarget | GPS target label | GPS Location for Management |
| todayRecords | Today's records title | Today's Records |
| noRecordsToday | No records message | No records registered for today yet |
| tipTitle | Tip title | Daily Management Tip |
| tipText | Tip text | Be mindful of recording your check-in... |
| currency | Currency symbol | EGP |
| operationsCount | Operations count unit | Ops |
| adminName | Admin name | General Manager |
| employeeName | Employee name | Kareem Employee |
| confirmDelete | Delete confirmation | Are you sure you want to delete? |
| financeNotif | Finance notification | Financial Operation |
| attendanceNotif | Attendance notification | Attendance Record |
| loginNotif | Login notification | User Login |
| logoutNotif | Logout notification | User Logout |
| deleteNotif | Delete notification | Record Deleted |

## Testing Your Translation

1. Save all your changes
2. Run `npm run dev`
3. Change the language in the UI
4. Verify all text is properly translated
5. Check RTL/LTR alignment if applicable

## Best Practices

1. **Keep keys consistent**: Don't change the key names, only the values
2. **Test thoroughly**: Check all pages and features
3. **Consider context**: Some words may need different translations in different contexts
4. **Use native speakers**: If possible, have a native speaker review your translations
5. **Handle special characters**: Make sure to escape quotes and special characters properly

## Need Help?

If you encounter any issues while adding a new language, please check:
- All translation keys are present
- The language code is added to the index file
- The language switcher is updated (if needed)
- RTL/LTR direction is properly configured

---

Happy translating! 🌍
