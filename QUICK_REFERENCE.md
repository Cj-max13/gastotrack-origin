# GastoTrack - Quick Reference Guide

## 🎯 What Was Created

### AI Service (Python FastAPI) - COMPLETE ✨

**Location**: `ai-service/Fast_API.py`

**Endpoints**:

- `GET /health` - Service status
- `POST /analyze` - Analyze spending by category
- `POST /predict` - Predict next month's spending
- `POST /recommendations` - Get AI financial tips
- `POST /categorize` - Auto-categorize merchants

**Example Usage**:

```python
# Analyze spending
POST /analyze
{
  "transactions": [
    {"merchant": "Starbucks", "amount": 150, "category": "food", "date": "2024-05-16"}
  ]
}

# Get recommendations
POST /recommendations
{
  "total_spent": 5000,
  "category_breakdown": {"food": 2000, "transport": 1500},
  "income": 20000
}
```

---

### Mobile Components - COMPLETE ✨

**Location**: `mobile/src/components/`

#### Button

```javascript
import { Button } from "../components";

<Button label="Submit" variant="primary" onPress={() => {}} />;
```

Variants: `primary`, `secondary`, `danger`, `ghost`

#### Input

```javascript
import { Input } from "../components";

<Input placeholder="Email" value={email} onChangeText={setEmail} />;
```

#### Card

```javascript
import { Card } from "../components";

<Card title="Summary">{/* Content */}</Card>;
```

#### Badge

```javascript
import { Badge } from "../components";

<Badge label="Active" variant="success" />;
```

Variants: `primary`, `success`, `warning`, `danger`

#### ListItem

```javascript
import { ListItem } from "../components";

<ListItem
  icon="fast-food"
  title="McDonald's"
  subtitle="Food • May 16"
  amount={-150}
/>;
```

#### AlertDialog

```javascript
import { AlertDialog } from "../components";

<AlertDialog
  visible={showAlert}
  title="Confirm"
  message="Delete this transaction?"
  onConfirm={handleDelete}
  type="warning"
/>;
```

---

### Mobile Utilities - COMPLETE ✨

**Location**: `mobile/src/utils/`

#### AuthContext

```javascript
import { useAuth } from "../utils";

const { user, login, register, logout, isSignedIn } = useAuth();
```

#### Helpers

```javascript
import {
  formatCurrency,
  formatDate,
  getCategoryIcon,
  getCategoryColor,
  calculatePercentage,
} from "../utils/helpers";

formatCurrency(1500); // ₱1,500.00
formatDate(new Date()); // May 16, 2024
getCategoryIcon("food"); // 'fast-food'
getCategoryColor("food"); // '#FF9800'
```

#### Theme

```javascript
import { colors, spacing, typography } from "../utils/theme";

colors.primary; // '#0D2B2B'
spacing.md; // 16
typography.h1; // { fontSize: 32, fontWeight: '700' }
```

---

### Mobile Navigation - COMPLETE ✨

**Location**: `mobile/src/navigation/RootNavigator.js`

**Structure**:

```
AuthStack (Login, Register)
    ↓
MainTabs (if authenticated)
  ├── Dashboard
  ├── History
  ├── Budget
  ├── Analytics
  └── AI Assistant
```

**How It Works**:

1. App loads with AuthProvider
2. AuthContext checks for saved token
3. Renders appropriate stack (Auth or Main)
4. Auto-redirects to login if token expired

---

## 🛠️ Development Tips

### Adding a New Screen

1. Create file in `src/screens/`
2. Import components from `src/components/`
3. Import utilities from `src/utils/`
4. Add to navigation in `RootNavigator.js`

### Adding a New Component

1. Create file in `src/components/`
2. Export from `src/components/index.js`
3. Use across all screens

### API Calls

```javascript
import api from "../services/api";

// Token is auto-added
const response = await api.get("/transactions");
const result = await api.post("/transactions", data);
```

---

## 📱 Screen Template

```javascript
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../utils";
import { Card, Button } from "../components";
import api from "../services/api";

export default function MyScreen() {
  const { user } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Card title="My Card">
          <Text>Content here</Text>
        </Card>

        <Button label="Action" onPress={() => {}} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
});
```

---

## 🔐 Authentication Flow

1. User enters credentials on LoginScreen
2. `login()` from AuthContext called
3. Backend authenticates and returns JWT token
4. Token stored in AsyncStorage
5. Token added to all future API requests
6. Navigation updates to MainTabs automatically
7. If logged in: MainTabs shown, else: AuthStack shown

---

## 📊 Data Flow

```
Mobile App
    ↓
api.js (Axios)
    ↓
Backend API (Express)
    ↓
Database (PostgreSQL)

For AI Features:
    ↓
AI Service (FastAPI)
    ↓
Analysis/Predictions
```

---

## 🐛 Common Issues & Solutions

### Issue: API calls fail

**Solution**:

- Check `EXPO_PUBLIC_API_URL` in `.env`
- Verify backend is running
- Check token in AsyncStorage

### Issue: Navigation not working

**Solution**:

- Ensure AuthProvider wraps Navigation
- Check AuthContext returns correct values
- Verify navigation imports

### Issue: Components styling looks off

**Solution**:

- Import styles from `theme.js`
- Use spacing constants
- Check color values

---

## 🚀 Common Commands

```bash
# Backend
npm run dev          # Start development server
npx prisma studio   # View database GUI
npx prisma migrate dev  # Run migrations

# AI Service
python -m uvicorn Fast_API:app --reload

# Mobile
npx expo start       # Start development
npx expo prebuild    # Generate native code
eas build            # Build for deployment
```

---

## 📖 File Organization

```
src/
├── components/     # Reusable UI components
├── navigation/     # Navigation setup
├── screens/        # Screen components
├── services/       # API and external services
└── utils/          # Helpers, context, theme
```

---

## 💡 Best Practices

1. **Use components** - Don't rebuild UI from scratch
2. **Follow theme** - Use `colors`, `spacing`, `typography`
3. **Error handling** - Always wrap API calls in try-catch
4. **Prop drilling** - Use AuthContext for global state
5. **Performance** - Memoize expensive calculations
6. **Accessibility** - Label interactive elements

---

## 🔗 Important Links

- Backend API: `http://[DEV_IP]:3000`
- AI Service: `http://[DEV_IP]:8000`
- Database: PostgreSQL URL in `.env`
- Gemini API: console.cloud.google.com

---

## ✅ Pre-Deployment Checklist

- [ ] All `.env` files configured
- [ ] Database migrations run
- [ ] Gemini API key set
- [ ] Backend tests passing
- [ ] Mobile app tested on devices
- [ ] API endpoints verified
- [ ] Error handling in place
- [ ] Security headers set
- [ ] CORS properly configured
- [ ] Rate limiting enabled

---

## 🆘 Support

**For issues**:

1. Check error messages in logs
2. Verify environment variables
3. Test API endpoints with Postman
4. Review database schema
5. Check mobile console logs

**Documentation**: See `IMPLEMENTATION_SUMMARY.md`
