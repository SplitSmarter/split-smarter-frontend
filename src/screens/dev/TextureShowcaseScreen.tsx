import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, {LinearGradient as SvgGradient, Stop, Defs, Pattern, Path, Rect, Circle, Line} from 'react-native-svg';


const { width } = Dimensions.get('window');

export default function TextureShowcase() {
    const [activeTab, setActiveTab] = useState<'all' | 'glass' | 'grid' | 'ambient'>('all');

    return (
        <ScrollView className="flex-1 bg-slate-950 pt-14 px-4 pb-10">
            {/* Header */}
            <View className="mb-6">
                <Text className="text-3xl font-extrabold text-white tracking-tight">
                    Texture & Overlays
                </Text>
                <Text className="text-slate-400 text-sm mt-1">
                    Premium UI surfaces for Split Smarter built with your stack.
                </Text>
            </View>

            {/* --- TECHNIQUE 1: THE PREMIUM FINTECH MESH GRID --- */}
            {(activeTab === 'all' || activeTab === 'grid') && (
                <View className="mb-6 rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 h-52 relative justify-between p-6 shadow-2xl">
                    {/* SVG Tech Grid Texture Overlay */}
                    <View className="absolute inset-0 opacity-40">
                        <Svg width="100%" height="100%">
                            <Defs>
                                <Pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
                                    <Path d="M 24 0 L 0 0 0 24" fill="none" stroke="#38bdf8" strokeWidth="0.6" strokeOpacity="0.3" />
                                    <Circle cx="24" cy="0" r="1" fill="#38bdf8" opacity="0.5" />
                                </Pattern>
                            </Defs>
                            <Rect width="100%" height="100%" fill="url(#grid)" />
                        </Svg>
                    </View>

                    {/* Soft linear ambient glow behind text */}
                    <LinearGradient
                        colors={['transparent', 'rgba(15, 23, 42, 0.85)']}
                        className="absolute inset-0"
                    />

                    <View className="flex-row justify-between items-start z-10">
                        <View>
                            <Text className="text-xs font-bold text-sky-400 uppercase tracking-widest">Smart Ledger Asset</Text>
                            <Text className="text-2xl font-bold text-white mt-1">Cyber Grid Overlay</Text>
                        </View>
                        <View className="bg-sky-500/10 border border-sky-500/30 px-2.5 py-1 rounded-full">
                            <Text className="text-[10px] text-sky-400 font-mono">SVG PATTERN</Text>
                        </View>
                    </View>

                    <View className="z-10">
                        <Text className="text-xs text-slate-400 font-mono">STABILITY // SYSTEM_ACTIVE</Text>
                        <Text className="text-xl font-semibold text-slate-200 mt-1">$14,250.82</Text>
                    </View>
                </View>
            )}

            {/* --- TECHNIQUE 2: THE GLASSMORPHIC FROST --- */}
            {(activeTab === 'all' || activeTab === 'glass') && (
                <View className="mb-6 h-52 rounded-3xl overflow-hidden relative justify-center items-center">
                    {/* Dynamic background layers creating contrast for the glass */}
                    <View className="absolute top-4 left-6 w-32 h-32 rounded-full bg-emerald-500 blur-2xl opacity-60" />
                    <View className="absolute bottom-2 right-10 w-40 h-40 rounded-full bg-teal-600 blur-3xl opacity-70" />

                    {/* Linear gradient to simulate glass reflectivity reflection */}
                    <LinearGradient
                        colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.03)']}
                        className="absolute inset-0 z-10 border border-white/20 rounded-3xl"
                    />

                    {/* Blur Component */}
                    <BlurView intensity={25} tint="dark" className="absolute inset-0 justify-between p-6">
                        <View className="flex-row justify-between items-center">
                            <Text className="text-white font-medium text-lg tracking-wide">Split Smarter Premium</Text>
                            <View className="w-8 h-8 rounded-full bg-white/10 border border-white/20 items-center justify-center">
                                <Text className="text-white text-xs">✦</Text>
                            </View>
                        </View>

                        <View>
                            <Text className="text-white/60 text-xs uppercase tracking-wider">Total Group Balance</Text>
                            <Text className="text-3xl font-light text-white mt-1">$1,240.<Text className="font-bold">50</Text></Text>
                        </View>
                    </BlurView>
                </View>
            )}

            {/* --- TECHNIQUE 3: AMBIENT VEIL & GRADIENT RAY --- */}
            {(activeTab === 'all' || activeTab === 'ambient') && (
                <View className="mb-6 rounded-3xl overflow-hidden bg-slate-900 border border-slate-800/80 h-52 relative justify-between p-6">
                    {/* Glowing Corner Ray Effect */}
                    <LinearGradient
                        // colors={['rgba(236, 72, 153, 0.25)', 'rgba(99, 102, 241, 0.15)', 'transparent']}
                        colors={['rgba(43, 135, 97, 0.35)', 'rgba(94, 234, 212, 0.15)', 'transparent']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        className="absolute inset-0"
                    />

                    {/* Subtle horizontal line ticks for scale texture */}
                    <View className="absolute right-0 top-0 bottom-0 w-1/3 opacity-20 flex justify-between py-8 pr-4 items-end">
                        {[...Array(5)].map((_, i) => (
                            <View key={i} className="h-[1px] bg-white" style={{ width: i % 2 === 0 ? 20 : 10 }} />
                        ))}
                    </View>

                    <View className="flex-row justify-between items-start">
                        <View>
                            <Text className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">AI Insights</Text>
                            <Text className="text-xl font-bold text-white mt-0.5">Predictive Analysis</Text>
                        </View>
                    </View>

                    <Text className="text-sm text-slate-300 max-w-[75%] leading-relaxed">
                        Your shared expenses went down by <Text className="text-emerald-400 font-bold">12%</Text> this week compared to last month.
                    </Text>

                    <View className="border-t border-slate-800 pt-3 flex-row justify-between items-center">
                        <Text className="text-xs text-slate-500">Updated 3m ago</Text>
                        <Text className="text-xs text-indigo-400 font-medium">View details →</Text>
                    </View>
                </View>
            )}

            {/* --- TECHNIQUE 4: MODERN MINIMALIST TOPO (DOT MATRIX) --- */}
            {activeTab === 'all' && (
                <View className="mb-12 rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-800 h-48 relative p-6 justify-between">
                    {/* Dot Matrix Texture Overlay */}
                    <View className="absolute inset-0 opacity-25">
                        <Svg width="100%" height="100%">
                            <Defs>
                                <Pattern id="dots" width="16" height="16" patternUnits="userSpaceOnUse">
                                    <Circle cx="2" cy="2" r="1" fill="#a1a1aa" />
                                </Pattern>
                            </Defs>
                            <Rect width="100%" height="100%" fill="url(#dots)" />
                        </Svg>
                    </View>

                    <View className="flex-row justify-between items-center">
                        <Text className="text-zinc-400 text-xs font-mono tracking-wider">ROUTING_GATEWAY // SECURE</Text>
                        <View className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    </View>

                    <View>
                        <Text className="text-xs text-zinc-500 uppercase">Active Split Session</Text>
                        <Text className="text-2xl font-bold text-zinc-100 mt-0.5">Trip to Goa &#39;26</Text>
                    </View>

                    <Text className="text-xs text-zinc-400">
                        6 Members • Status: Waiting for settlements
                    </Text>
                </View>
            )}
            <MoreTextures />

            <NewForestTexture />

        </ScrollView>
    );
}


function MoreTextures() {
    return (
        <View className="px-4 pb-12 bg-slate-950">

            {/* --- TECHNIQUE 5: THE STRIPE-INSPIRED ISOMETRIC DIAGONAL --- */}
            <View className="mb-6 rounded-3xl overflow-hidden bg-zinc-950 border border-zinc-800/80 h-52 relative justify-between p-6 shadow-2xl">
                {/* Repeating Vector Shards */}
                <View className="absolute inset-0 opacity-20">
                    <Svg width="100%" height="100%">
                        <Defs>
                            <Pattern id="diagonal-stripes" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                                <Rect width="20" height="40" fill="#ffffff" opacity="0.15" />
                                <Line x1="0" y1="0" x2="0" y2="40" stroke="#ffffff" strokeWidth="1" />
                            </Pattern>
                        </Defs>
                        <Rect width="100%" height="100%" fill="url(#diagonal-stripes)" />
                    </Svg>
                </View>

                {/* Underlying Corner Radial Glow */}
                <LinearGradient
                    colors={['rgba(99, 102, 241, 0.25)', 'transparent']}
                    start={{ x: 1, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    className="absolute inset-0"
                />

                <View className="flex-row justify-between items-start z-10">
                    <View>
                        <Text className="text-xs font-mono text-indigo-400 uppercase tracking-widest">Cross-Border FX</Text>
                        <Text className="text-2xl font-bold text-zinc-100 mt-1">Isometric Shard</Text>
                    </View>
                    <View className="bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded-md">
                        <Text className="text-[10px] font-mono text-zinc-400">v1.0.2</Text>
                    </View>
                </View>

                <View className="z-10 flex-row justify-between items-end">
                    <View>
                        <Text className="text-[10px] text-zinc-500 uppercase tracking-wider">Settlement Node</Text>
                        <Text className="text-lg font-semibold text-zinc-300 font-mono">EUR/INR // MID-MARKET</Text>
                    </View>
                    <Text className="text-xl font-bold text-emerald-400">+0.42%</Text>
                </View>
            </View>


            {/* --- TECHNIQUE 6: GENERATIVE TOPOGRAPHIC MATH WAVES --- */}
            <View className="mb-6 rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 h-52 relative justify-between p-6">
                {/* Dynamic Vector Curves simulating depth */}
                <View className="absolute inset-0 opacity-30">
                    <Svg width="100%" height="100%" viewBox="0 0 400 200">
                        <Defs>
                            <SvgGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <Stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8" />
                                <Stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
                            </SvgGradient>
                        </Defs>
                        {/* Layered parametric line tracks */}
                        <Path d="M0,120 Q100,60 200,130 T400,90" fill="none" stroke="url(#waveGrad)" strokeWidth="1.5" />
                        <Path d="M0,140 Q90,80 210,150 T400,110" fill="none" stroke="url(#waveGrad)" strokeWidth="1" />
                        <Path d="M0,100 Q110,40 190,110 T400,70" fill="none" stroke="url(#waveGrad)" strokeWidth="0.8" strokeDasharray="4 4" />
                        <Path d="M0,160 Q80,100 220,170 T400,130" fill="none" stroke="url(#waveGrad)" strokeWidth="0.5" />
                    </Svg>
                </View>

                <View className="z-10">
                    <Text className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Liquidity Vector</Text>
                    <Text className="text-2xl font-bold text-white mt-0.5">Topographic Flow</Text>
                </View>

                <View className="z-10 flex-row justify-between items-center bg-slate-950/40 p-3 rounded-xl border border-white/5 backdrop-blur-md">
                    <View>
                        <Text className="text-[10px] text-slate-400 uppercase">Pool Contribution</Text>
                        <Text className="text-sm font-semibold text-white mt-0.5">Split Velocity Index</Text>
                    </View>
                    <Text className="text-lg font-bold text-cyan-300">89.4</Text>
                </View>
            </View>


            {/* --- TECHNIQUE 7: DIGITAL MATRIX HUD COORD (BRUTALIST) --- */}
            <View className="mb-6 rounded-3xl overflow-hidden bg-stone-950 border border-stone-800 h-52 relative justify-between p-6">
                {/* Crosshair & Radar Coordinates Texture */}
                <View className="absolute inset-0 opacity-25">
                    <Svg width="100%" height="100%">
                        {/* Center Grid ticks */}
                        <Path d="M 20,0 L 20,200 M 0,20 L 400,20" stroke="#a8a29e" strokeWidth="0.5" strokeDasharray="2 8" />
                        {/* Corner Bracket markers */}
                        <Path d="M 12,30 L 12,12 L 30,12" fill="none" stroke="#e7e5e4" strokeWidth="1.5" />
                        <Path d="M 350,30 L 350,12 L 332,12" fill="none" stroke="#e7e5e4" strokeWidth="1.5" />
                        {/* Decorative Tiny Ticks */}
                        <Circle cx="100" cy="140" r="1.5" fill="#e7e5e4" />
                        <Circle cx="250" cy="70" r="1.5" fill="#e7e5e4" />
                    </Svg>
                    {/* Subtle Right Alignment Guideline */}
                    <View className="absolute right-12 top-0 bottom-0 w-[1px] bg-stone-800 border-dashed" />
                </View>

                <View className="flex-row justify-between items-start z-10">
                    <View>
                        <Text className="text-[10px] font-mono text-orange-400 uppercase tracking-widest">// SECURE_CORE_VAULT</Text>
                        <Text className="text-xl font-bold text-stone-200 tracking-tight mt-1">Brutalist Blueprint</Text>
                    </View>
                    <Text className="text-xs font-mono text-stone-500">SYS_REF: 404_Z</Text>
                </View>

                <View className="z-10 flex-row justify-between items-baseline">
                    <View>
                        <Text className="text-[11px] font-mono text-stone-400">HASH: 7f81a2b9e</Text>
                        <Text className="text-2xl font-light text-stone-100 font-mono mt-0.5">0x7F...9EE2</Text>
                    </View>
                    <View className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-pulse" />
                </View>
            </View>

            <View className="mb-6 h-56 rounded-3xl overflow-hidden relative justify-between p-6 border border-white/5">
                {/* Backing shape */}
                <View className="absolute top-10 left-1/3 w-32 h-32 rounded-full bg-violet-600 blur-2xl opacity-60" />

                {/* Soft base blur */}
                <BlurView intensity={35} tint="dark" className="absolute inset-0" />

                {/* Micro Noise Pattern via high frequency SVG circles */}
                <View className="absolute inset-0 opacity-[0.28]">
                    <Svg width="100%" height="100%">
                        <Defs>
                            <Pattern id="noise" width="4" height="4" patternUnits="userSpaceOnUse">
                                <Circle cx="1" cy="1" r="0.5" fill="#ffffff" />
                            </Pattern>
                        </Defs>
                        <Rect width="100%" height="100%" fill="url(#noise)" />
                    </Svg>
                </View>
            </View>

            {/* NEW ADDITION: FROSTED ACRYLIC GLASS */}
            <View className="mb-6 h-56 rounded-3xl overflow-hidden relative justify-center p-6 border border-white/10">
                {/* Base layer gradient */}
                <LinearGradient
                    colors={['rgba(255,255,255,0.4)', 'rgba(255,255,255,0.1)']}
                    className="absolute inset-0"
                />
                {/* High intensity frost */}
                <BlurView intensity={90} tint="light" className="absolute inset-0" />

                <View className="z-10">
                    <Text className="text-slate-900 font-black text-xl tracking-tight">Frosted Acrylic</Text>
                    <Text className="text-slate-800 text-xs font-semibold mt-1">High Diffusion / Soft Focus</Text>
                </View>
            </View>


        </View>
    );
}

function NewForestTexture() {
    const brandColor = '#2B8761';
    // Complementary color (a bright mint/teal works great for highlight)
    const highlightColor = '#5eead4';

    return (
        <View className="px-4 pb-12 bg-slate-950">

            {/* --- TECHNIQUE: THE AMBIENT FOREST GRID --- */}
            {/* Description:
          Uses your specified color (#2B8761) as a base gradient and combines it with
          a geometric mesh texture (inspired by Card 3) and bright complementary
          highlights (mint) for a precise, trustworthy fintech look.
      */}
            <View className="mb-6 rounded-3xl overflow-hidden border border-emerald-900 h-56 relative justify-between p-6 shadow-xl" style={{ backgroundColor: brandColor }}>

                {/* TEXTURE LAYER: The Geometric Mesh Vector (similar to Card 3 lines) */}
                <View className="absolute inset-0 opacity-20">
                    <Svg width="100%" height="100%">
                        <Defs>
                            <Pattern id="forestGrid" width="30" height="30" patternUnits="userSpaceOnUse" patternTransform="rotate(15)">
                                {/* Thin connection lines */}
                                <Path d="M0,0 L30,0 M0,30 L30,30 M0,0 L0,30 M30,0 L30,30" stroke="#ffffff" strokeWidth="0.5" />
                                {/* Small node dots for depth */}
                                <Circle cx="0" cy="0" r="1.5" fill="#ffffff" />
                                <Circle cx="30" cy="30" r="1.5" fill="#ffffff" opacity="0.6" />
                            </Pattern>
                        </Defs>
                        <Rect width="100%" height="100%" fill="url(#forestGrid)" />
                    </Svg>
                </View>

                {/* GLOW LAYER: Ambient Ray (Mint highlight) */}
                <LinearGradient
                    colors={[`${highlightColor}33`, 'transparent']}
                    start={{ x: 1, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    className="absolute inset-0"
                />

                {/* Content - Top Row */}
                <View className="flex-row justify-between items-start z-10">
                    <View>
                        <Text className="text-xs font-mono font-bold uppercase tracking-widest" style={{ color: highlightColor }}>// Smart Settlement</Text>
                        <Text className="text-2xl font-bold text-white mt-1 tracking-tight">Trust Network v4</Text>
                    </View>
                    <View className="border px-2 py-0.5 rounded-md" style={{ borderColor: `${highlightColor}80` }}>
                        <Text className="text-[10px] font-mono text-white/90">SEC_CORE</Text>
                    </View>
                </View>

                {/* Content - Data Readout (inspired by fintech dashboards) */}
                <View className="z-10 flex-row justify-between items-end bg-black/10 p-4 rounded-xl border border-white/5">
                    <View>
                        <Text className="text-[11px] text-white/70 uppercase">Group Balance</Text>
                        <Text className="text-2xl font-light text-white mt-0.5">₹42,150.00</Text>
                    </View>
                    <View className="items-end">
                        <Text className="text-lg font-bold" style={{ color: highlightColor }}>+3.1%</Text>
                        <Text className="text-[10px] text-white/50">VS LAST SETTLEMENT</Text>
                    </View>
                </View>

            </View>
        </View>
    );
}