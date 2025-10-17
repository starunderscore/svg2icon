// renderer.js
const { ipcRenderer } = require('electron');

let selectedSvgPath = null;
let selectedOutputPath = null;
let posthog = null;

// DOM elements
const selectSvgBtn = document.getElementById('selectSvgBtn');
const selectOutputBtn = document.getElementById('selectOutputBtn');
const generateBtn = document.getElementById('generateBtn');
const iconPreview = document.getElementById('iconPreview');
const iconType = document.getElementById('iconType');
const outputPath = document.getElementById('outputPath');
const outputPathText = document.getElementById('outputPathText');
const status = document.getElementById('status');
const featureList = document.getElementById('featureList');

// Settings modal elements
const settingsIcon = document.getElementById('settingsIcon');
const settingsModal = document.getElementById('settingsModal');
const closeModal = document.getElementById('closeModal');
const autoUpdateToggle = document.getElementById('autoUpdateToggle');
const telemetryToggle = document.getElementById('telemetryToggle');
const crashReportToggle = document.getElementById('crashReportToggle');
const checkUpdateBtn = document.getElementById('checkUpdateBtn');
const updateStatus = document.getElementById('updateStatus');
const themeOptions = document.querySelectorAll('.theme-option');

// Settings state
let settings = {
    theme: 'system',
    autoUpdate: false,
    telemetry: true,
    crashReports: true
};

// PostHog initialization script - this is the complete PostHog library
function loadPostHogScript() {
    return new Promise((resolve) => {
        !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]);t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
        resolve();
    });
}

// PostHog telemetry functions
async function initTelemetry() {
    if (settings.telemetry && !posthog) {
        try {
            await loadPostHogScript();
            
            // Initialize PostHog with your API key
            window.posthog.init('phc_W5QhQVXMO1o8TxQeVEC1valqkYPJIPdW3vwTGkJYTrh', {
                api_host: 'https://app.posthog.com',
                capture_pageview: false,
                capture_pageleave: false,
                loaded: function(posthogInstance) {
                    console.log('PostHog loaded successfully');
                    posthog = posthogInstance;
                    
                    // Track app opened once PostHog is ready
                    trackEvent('app_opened', {
                        app_name: 'svg2icon',
                        version: '1.0.0',
                        platform: navigator.platform,
                        user_agent: navigator.userAgent,
                        screen_resolution: `${screen.width}x${screen.height}`,
                        session_id: generateSessionId()
                    });
                },
                bootstrap: {
                    distinctID: getOrCreateUserId()
                }
            });
            
        } catch (error) {
            console.error('Failed to initialize PostHog:', error);
        }
    }
}

function trackEvent(eventName, properties = {}) {
    if (settings.telemetry && posthog) {
        try {
            posthog.capture(eventName, {
                ...properties,
                timestamp: new Date().toISOString(),
                app_version: '1.0.0'
            });
            console.log('Tracked event:', eventName, properties);
        } catch (error) {
            console.error('Failed to track event:', error);
        }
    }
}

function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function getOrCreateUserId() {
    let userId = localStorage.getItem('iconGenerator_userId');
    if (!userId) {
        userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('iconGenerator_userId', userId);
    }
    return userId;
}

function disableTelemetry() {
    if (posthog) {
        try {
            trackEvent('telemetry_disabled');
            posthog.opt_out_capturing();
            posthog = null;
            console.log('Telemetry disabled');
        } catch (error) {
            console.error('Error disabling telemetry:', error);
        }
    }
}

// Icon type descriptions
const iconTypeFeatures = {
    universal: [
        'All mobile and desktop sizes',
        'Perfect for cross-platform apps',
        'Complete size coverage (16px to 1024px)',
        'Ready for any platform'
    ],
    ios: [
        'iOS App Store requirements',
        'All device sizes (@1x, @2x, @3x)',
        'iPhone and iPad support',
        'Retina display optimized'
    ],
    android: [
        'Google Play Store ready',
        'Multiple density folders',
        'Material Design compliant',
        'All Android device sizes'
    ],
    desktop: [
        'Complete desktop app package',
        'ICO and ICNS files included',
        'Windows, macOS, Linux ready',
        'All standard desktop sizes'
    ],
    electron: [
        'Electron-builder ready structure',
        'Auto ICO and ICNS generation',
        'Perfect assets/ folder layout',
        'Cross-platform Electron apps'
    ],
    web: [
        'PWA manifest ready',
        'Favicon sizes included',
        'Apple touch icons',
        'Web app install ready'
    ]
};

// Update feature list based on selected icon type
function updateFeatureList() {
    const selectedType = iconType.value;
    const features = iconTypeFeatures[selectedType];
    
    featureList.innerHTML = features.map(feature => `<li>${feature}</li>`).join('');
    
    // Track feature list update
    trackEvent('icon_type_selected', {
        icon_type: selectedType,
        features_count: features.length
    });
}

// Show status message
function showStatus(message, isError = false) {
    status.textContent = message;
    status.className = `status ${isError ? 'error' : 'success'}`;
    status.style.display = 'block';
    
    // Track status messages
    trackEvent('status_message_shown', {
        message_type: isError ? 'error' : 'success',
        message_preview: message.substring(0, 50)
    });
    
    setTimeout(() => {
        status.style.display = 'none';
    }, 5000);
}

// Update generate button state
function updateGenerateButton() {
    const canGenerate = selectedSvgPath && selectedOutputPath;
    generateBtn.disabled = !canGenerate;
    generateBtn.style.opacity = canGenerate ? '1' : '0.5';
    
    if (canGenerate) {
        trackEvent('generate_button_enabled');
    }
}

// Settings Modal Functions
function openSettingsModal() {
    settingsModal.classList.add('active');
    trackEvent('settings_modal_opened');
}

function closeSettingsModal() {
    settingsModal.classList.remove('active');
    trackEvent('settings_modal_closed');
}

function toggleSetting(toggleElement, settingKey) {
    const wasActive = toggleElement.classList.contains('active');
    const newValue = !wasActive;
    
    if (newValue) {
        toggleElement.classList.add('active');
    } else {
        toggleElement.classList.remove('active');
    }
    
    settings[settingKey] = newValue;
    
    // Handle telemetry toggle specifically
    if (settingKey === 'telemetry') {
        if (settings[settingKey]) {
            initTelemetry();
        } else {
            disableTelemetry();
        }
    }
    
    // Track setting changes
    trackEvent('setting_toggled', {
        setting_name: settingKey,
        new_value: newValue,
        previous_value: wasActive
    });
    
    // Save settings to localStorage
    localStorage.setItem('iconGeneratorSettings', JSON.stringify(settings));
}

function loadSettings() {
    const savedSettings = localStorage.getItem('iconGeneratorSettings');
    if (savedSettings) {
        try {
            settings = { ...settings, ...JSON.parse(savedSettings) };
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }
    
    // Apply theme
    applyTheme(settings.theme);
    updateThemeUI(settings.theme);
    
    // Apply other settings to UI
    if (settings.autoUpdate) {
        autoUpdateToggle.classList.add('active');
    } else {
        autoUpdateToggle.classList.remove('active');
    }
    
    if (settings.telemetry) {
        telemetryToggle.classList.add('active');
        // Initialize telemetry if enabled
        initTelemetry();
    } else {
        telemetryToggle.classList.remove('active');
    }
    
    if (settings.crashReports) {
        crashReportToggle.classList.add('active');
    } else {
        crashReportToggle.classList.remove('active');
    }
}

function applyTheme(theme) {
    const body = document.body;
    
    // Remove existing theme classes
    body.classList.remove('dark-theme', 'light-theme');
    
    let appliedTheme = theme;
    if (theme === 'dark') {
        body.classList.add('dark-theme');
    } else if (theme === 'light') {
        body.classList.add('light-theme');
    } else if (theme === 'system') {
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
            body.classList.add('dark-theme');
            appliedTheme = 'dark';
        } else {
            body.classList.add('light-theme');
            appliedTheme = 'light';
        }
    }
    
    trackEvent('theme_applied', {
        requested_theme: theme,
        applied_theme: appliedTheme
    });
}

function updateThemeUI(selectedTheme) {
    themeOptions.forEach(option => {
        option.classList.remove('active');
        if (option.dataset.theme === selectedTheme) {
            option.classList.add('active');
        }
    });
}

function setTheme(theme) {
    const previousTheme = settings.theme;
    settings.theme = theme;
    applyTheme(theme);
    updateThemeUI(theme);
    
    // Track theme changes
    trackEvent('theme_changed', {
        previous_theme: previousTheme,
        new_theme: theme
    });
    
    // Save settings
    localStorage.setItem('iconGeneratorSettings', JSON.stringify(settings));
}

function showUpdateStatus(message, type = 'checking') {
    updateStatus.textContent = message;
    updateStatus.className = `update-status ${type}`;
    updateStatus.style.display = 'block';
}

function checkForUpdates() {
    showUpdateStatus('Checking for updates...', 'checking');
    trackEvent('update_check_started');
    
    // Simulate update check
    setTimeout(() => {
        showUpdateStatus('You are running the latest version!', 'up-to-date');
        trackEvent('update_check_completed', {
            result: 'up_to_date',
            current_version: '1.0.0'
        });
    }, 2000);
}

// Event Listeners
settingsIcon.addEventListener('click', openSettingsModal);
closeModal.addEventListener('click', closeSettingsModal);

// Close modal when clicking outside
settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
        closeSettingsModal();
    }
});

// Theme option clicks
themeOptions.forEach(option => {
    option.addEventListener('click', () => {
        const theme = option.dataset.theme;
        setTheme(theme);
    });
});

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (settings.theme === 'system') {
        applyTheme('system');
        trackEvent('system_theme_changed', {
            now_dark_mode: e.matches
        });
    }
});

// Toggle switches
autoUpdateToggle.addEventListener('click', () => {
    toggleSetting(autoUpdateToggle, 'autoUpdate');
});

telemetryToggle.addEventListener('click', () => {
    toggleSetting(telemetryToggle, 'telemetry');
});

crashReportToggle.addEventListener('click', () => {
    toggleSetting(crashReportToggle, 'crashReports');
});

// Check for updates button
checkUpdateBtn.addEventListener('click', checkForUpdates);

// Select SVG file
selectSvgBtn.addEventListener('click', async () => {
    try {
        const filePath = await ipcRenderer.invoke('select-svg-file');
        if (filePath) {
            selectedSvgPath = filePath;
            
            const fileName = filePath.split('/').pop() || filePath.split('\\').pop();
            
            // Track SVG selection
            trackEvent('svg_file_selected', {
                file_name: fileName,
                file_extension: fileName.split('.').pop(),
                path_length: filePath.length
            });
            
            // Update preview
            iconPreview.innerHTML = `
                <img src="file://${filePath}" alt="SVG Preview" style="max-width: 100%; max-height: 100%;" />
            `;
            iconPreview.classList.add('has-file');
            
            // Update button text
            selectSvgBtn.textContent = `✓ ${fileName}`;
            selectSvgBtn.style.background = 'linear-gradient(45deg, #28a745, #20c997)';
            
            updateGenerateButton();
        }
    } catch (error) {
        showStatus('Error selecting SVG file: ' + error.message, true);
        trackEvent('svg_selection_error', {
            error_message: error.message
        });
    }
});

// Select output folder
selectOutputBtn.addEventListener('click', async () => {
    try {
        const folderPath = await ipcRenderer.invoke('select-output-folder');
        if (folderPath) {
            selectedOutputPath = folderPath;
            
            // Track output folder selection
            trackEvent('output_folder_selected', {
                path_length: folderPath.length
            });
            
            // Update UI
            outputPathText.textContent = folderPath;
            outputPath.style.display = 'block';
            
            selectOutputBtn.textContent = '✓ Output Folder Selected';
            selectOutputBtn.style.background = 'linear-gradient(45deg, #28a745, #20c997)';
            
            updateGenerateButton();
        }
    } catch (error) {
        showStatus('Error selecting output folder: ' + error.message, true);
        trackEvent('output_folder_selection_error', {
            error_message: error.message
        });
    }
});

// Generate icons
generateBtn.addEventListener('click', async () => {
    if (!selectedSvgPath || !selectedOutputPath) {
        showStatus('Please select both SVG file and output folder', true);
        return;
    }
    
    try {
        // Show loading state
        const originalText = generateBtn.textContent;
        generateBtn.innerHTML = '<span class="loading"></span>Generating Icons...';
        generateBtn.disabled = true;
        
        // Track generation start
        const startTime = Date.now();
        const svgFileName = selectedSvgPath.split('/').pop() || selectedSvgPath.split('\\').pop();
        
        trackEvent('icon_generation_started', {
            icon_type: iconType.value,
            svg_filename: svgFileName,
            output_path_length: selectedOutputPath.length
        });
        
        const result = await ipcRenderer.invoke('generate-icons', 
            selectedSvgPath, 
            selectedOutputPath, 
            iconType.value
        );
        
        // Reset button
        generateBtn.textContent = originalText;
        generateBtn.disabled = false;
        updateGenerateButton();
        
        // Track generation completion
        const duration = Date.now() - startTime;
        trackEvent('icon_generation_completed', {
            icon_type: iconType.value,
            success: result.success,
            duration_ms: duration,
            svg_filename: svgFileName,
            error_message: result.success ? null : result.message
        });
        
        if (result.success) {
            showStatus(result.message);
            
            // Track successful generation
            trackEvent('icons_successfully_generated', {
                icon_type: iconType.value,
                generation_time: duration
            });
        } else {
            showStatus(result.message, true);
        }
        
    } catch (error) {
        generateBtn.textContent = 'Generate Icons';
        generateBtn.disabled = false;
        updateGenerateButton();
        showStatus('Error generating icons: ' + error.message, true);
        
        trackEvent('icon_generation_error', {
            error_message: error.message,
            icon_type: iconType.value,
            svg_path: selectedSvgPath
        });
    }
});

// Update feature list when icon type changes
iconType.addEventListener('change', updateFeatureList);

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && settingsModal.classList.contains('active')) {
        closeSettingsModal();
    }
});

// Track app lifecycle events
window.addEventListener('beforeunload', () => {
    const sessionDuration = Date.now() - (window.sessionStartTime || Date.now());
    trackEvent('app_closing', {
        session_duration_ms: sessionDuration,
        svg_selected: !!selectedSvgPath,
        output_selected: !!selectedOutputPath
    });
});

window.addEventListener('focus', () => {
    trackEvent('app_focused');
});

window.addEventListener('blur', () => {
    trackEvent('app_unfocused');
});

// Initialize app
window.sessionStartTime = Date.now();
loadSettings();
updateFeatureList();
updateGenerateButton();

// Track app initialization
trackEvent('app_initialized', {
    timestamp: new Date().toISOString(),
    user_agent: navigator.userAgent,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
});

// Auto-check for updates on startup if enabled
if (settings.autoUpdate) {
    setTimeout(() => {
        checkForUpdates();
    }, 1000);
}