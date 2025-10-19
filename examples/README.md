# 📁 Example SVG Icons

This folder contains sample SVG files that demonstrate best practices for creating icons that will convert well to PNG format across all sizes.

## 🎨 Example Files

### 1. `app-icon.svg` - Complex App Icon
- **Size**: 1024x1024 (high resolution)
- **Features**: Gradients, multiple elements, text
- **Best for**: Main app icons that need detail
- **Use case**: iOS/Android app store icons

### 2. `simple-icon.svg` - Clean Geometric Icon  
- **Size**: 512x512 (medium resolution)
- **Features**: Simple shapes, solid colors
- **Best for**: Desktop applications, web apps
- **Use case**: Cross-platform compatibility

### 3. `minimal-icon.svg` - Ultra-Simple Icon
- **Size**: 256x256 (compact)
- **Features**: Single shape, minimal detail
- **Best for**: Small sizes, favicons
- **Use case**: Perfect for 16x16 to 64x64 icons

## ✅ SVG Best Practices

### 📏 **Size & ViewBox**
```xml
<!-- Use square dimensions -->
<svg width="512" height="512" viewBox="0 0 512 512">

<!-- Always include viewBox for proper scaling -->
```

### 🎨 **Design Guidelines**

**✅ DO:**
- Use square aspect ratios (1:1)
- Keep designs simple and recognizable
- Use vector shapes instead of raster images
- Include proper margins (don't touch edges)
- Use solid colors or simple gradients
- Test at small sizes (16x16, 32x32)

**❌ DON'T:**
- Use tiny details that disappear when scaled down
- Include text unless it's part of the logo
- Use complex patterns or textures
- Make stroke widths too thin (<2px)
- Use too many colors (keep it simple)
- Rely on external fonts or images

### 🔧 **Technical Requirements**

**File Format:**
- Extension: `.svg`
- Encoding: UTF-8
- No external dependencies

**Structure:**
```xml
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <!-- Your icon content here -->
</svg>
```

**Colors:**
- Use hex colors: `#ff0000` ✅
- Or RGB: `rgb(255,0,0)` ✅  
- Avoid named colors: `red` ❌

### 📱 **Size Recommendations by Platform**

| Platform | Recommended Source Size | Notes |
|----------|------------------------|-------|
| **iOS Apps** | 1024x1024px | App Store requirement |
| **Android Apps** | 512x512px | Play Store standard |
| **Desktop Apps** | 512x512px | Good for all desktop sizes |
| **Web Apps** | 512x512px | PWA manifest standard |
| **Favicons** | 256x256px | Minimum for good quality |

### 🎯 **Testing Your SVG**

Before generating icons, test your SVG:

1. **Open in browser** - Does it display correctly?
2. **Scale down** - Is it readable at 32x32px?
3. **Check colors** - Do they have good contrast?
4. **Remove text** - Can you recognize it without words?
5. **Simplify** - Can you reduce complexity while keeping meaning?

## 🚀 **Quick Start**

1. **Choose a template** from the examples above
2. **Modify the design** to fit your app
3. **Test at different sizes** in your browser
4. **Run through SVG2Icon** to create your icon set

## 💡 **Pro Tips**

- **Start big, scale down**: Design at 1024x1024, test at 16x16
- **Use even numbers**: Helps with pixel-perfect rendering
- **Test in grayscale**: Ensures good contrast and recognition
- **Keep it memorable**: Simple, distinctive shapes work best
- **Consider context**: Where will this icon be seen?

---

**Need inspiration?** Check out:
- [Heroicons](https://heroicons.com/) - Simple, clean SVG icons
- [Lucide](https://lucide.dev/) - Beautiful & consistent icon pack
- [Tabler Icons](https://tabler-icons.io/) - Free SVG icons
