import usePhoto from "@/hooks/usePhoto";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  Dimensions,
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  clamp,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

// Zoom level presets
const ZOOM_PRESETS = [
  { label: "0.5×", value: 0.0 },
  { label: "1×", value: 0.0 }, // maps to zoom=0 on expo-camera
  { label: "2×", value: 0.5 },
];

export default function CameraScreen() {
  const cameraRef = useRef<CameraView | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState("back");
  const [flash, setFlash] = useState("off");
  const [activePreset, setActivePreset] = useState(1);
  const [focusPoint, setFocusPoint] = useState(null);
  const router = useRouter();
  const { loading, uploadPhoto } = usePhoto();

  // Reanimated shared values
  const zoom = useSharedValue(0); // 0–1 range for expo-camera
  const zoomScale = useSharedValue(1); // visual pinch feedback
  const baseZoom = useSharedValue(0); // zoom at pinch start
  const focusOpacity = useSharedValue(0); // focus ring fade
  const focusScale = useSharedValue(1.4); // focus ring scale-in

  // ─── Pinch gesture ───────────────────────────────────────────────────────

  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      baseZoom.value = zoom.value;
    })
    .onUpdate((e) => {
      // Map pinch scale to zoom range 0–1, smooth with spring physics
      const next = clamp(baseZoom.value + (e.scale - 1) * 0.3, 0, 1);
      zoom.value = next;
      zoomScale.value = withSpring(e.scale > 1 ? 1.02 : 0.98, {
        damping: 20,
        stiffness: 200,
      });

      // Snap nearest zoom preset label
      const nearest = next < 0.25 ? 0 : next < 0.6 ? 1 : 2;
      runOnJS(setActivePreset)(nearest);
    })
    .onEnd(() => {
      zoomScale.value = withSpring(1, { damping: 15, stiffness: 180 });
    });

  // ─── Tap to focus ────────────────────────────────────────────────────────

  const tapGesture = Gesture.Tap().onEnd((e) => {
    runOnJS(setFocusPoint)({ x: e.x, y: e.y });
    focusScale.value = 1.4;
    focusOpacity.value = 1;
    focusScale.value = withSpring(1, { damping: 14, stiffness: 160 });
    focusOpacity.value = withTiming(0, { duration: 1200 });
  });

  // Compose both gestures — pinch + tap run simultaneously
  const composed = Gesture.Simultaneous(pinchGesture, tapGesture);

  // ─── Animated styles ─────────────────────────────────────────────────────

  const viewfinderStyle = useAnimatedStyle(() => ({
    transform: [{ scale: zoomScale.value }],
  }));

  const focusRingStyle = useAnimatedStyle(() => ({
    opacity: focusOpacity.value,
    transform: [{ scale: focusScale.value }],
  }));

  // ─── Permission check ────────────────────────────────────────────────────

  if (!permission) return <View style={styles.root} />;

  if (!permission.granted) {
    return (
      <View style={styles.permissionWrap}>
        <Text style={styles.permissionTitle}>Camera Access</Text>
        <Text style={styles.permissionText}>
          PhotoHub needs access to your camera to take photos.
        </Text>
        <TouchableOpacity
          style={styles.permissionBtn}
          onPress={requestPermission}
        >
          <Text style={styles.permissionBtnText}>Allow Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── Zoom preset press ───────────────────────────────────────────────────

  const handlePreset = (index) => {
    setActivePreset(index);
    zoom.value = withSpring(ZOOM_PRESETS[index].value, {
      damping: 18,
      stiffness: 160,
    });
  };

  const toggleFlash = () =>
    setFlash((f) => (f === "off" ? "on" : f === "on" ? "auto" : "off"));

  const flashIcon = flash === "off" ? "⚡" : flash === "on" ? "⚡" : "A";

  const handleCapture = async () => {
    try {
      const photo = await cameraRef.current?.takePictureAsync();
      if (photo?.uri) {
        // In a real app, you'd likely want to save the photo to the device
        // or upload it to your server here. For this demo, we'll just log it.
        console.log("Photo captured:", photo.uri);
        const formData = new FormData();
        formData.append("image", {
          uri: photo.uri,
          name: `photo_${Date.now()}.jpg`,
          type: "image/jpeg",
        } as any);
        await uploadPhoto(formData);
      }
    } catch (error) {
      console.error("Error capturing photo:", error);
    }
  };

  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      <GestureDetector gesture={composed}>
        <Animated.View style={[styles.viewfinder, viewfinderStyle]}>
          <CameraView
            ref={cameraRef}
            style={StyleSheet.absoluteFill}
            facing={facing}
            flash={flash}
            zoom={zoom.value}
          />

          {loading && (
            <View style={StyleSheet.absoluteFillObject}>
              <View style={styles.permissionWrap}>
                <Image
                  source={{
                    uri: "https://cdn.pixabay.com/animation/2024/08/28/06/14/06-14-30-578_512.gif",
                  }}
                  style={{ width: 100, height: 100, marginBottom: 20 }}
                />
                <Text style={styles.permissionTitle}>Processing...</Text>
              </View>
            </View>
          )}

          {/* Rule of thirds grid */}
          <View style={styles.grid} pointerEvents="none">
            {[1, 2].map((i) => (
              <View
                key={`h${i}`}
                style={[
                  styles.gridLine,
                  styles.gridLineH,
                  { top: `${i * 33.33}%` },
                ]}
              />
            ))}
            {[1, 2].map((i) => (
              <View
                key={`v${i}`}
                style={[
                  styles.gridLine,
                  styles.gridLineV,
                  { left: `${i * 33.33}%` },
                ]}
              />
            ))}
          </View>

          {/* Corner brackets */}
          <View style={[styles.corner, styles.cornerTL]} pointerEvents="none" />
          <View style={[styles.corner, styles.cornerTR]} pointerEvents="none" />
          <View style={[styles.corner, styles.cornerBL]} pointerEvents="none" />
          <View style={[styles.corner, styles.cornerBR]} pointerEvents="none" />

          {/* Tap-to-focus ring */}
          {focusPoint && (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.focusRing,
                focusRingStyle,
                { top: focusPoint.y - 30, left: focusPoint.x - 30 },
              ]}
            />
          )}

          {/* Top controls */}
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.topBtn}
              onPress={() => router.replace("/gallery")}
            >
              <Text style={styles.topBtnText}>✕</Text>
            </TouchableOpacity>

            <View style={styles.topRight}>
              <TouchableOpacity style={styles.topBtn} onPress={toggleFlash}>
                <Text style={styles.topBtnText}>{flashIcon}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.topBtn}>
                <Text style={styles.topBtnText}>◎</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Zoom presets */}
          <View style={styles.zoomBar} pointerEvents="box-none">
            {ZOOM_PRESETS.map((p, i) => (
              <TouchableOpacity
                key={p.label}
                onPress={() => handlePreset(i)}
                style={styles.zoomBtnWrap}
              >
                <Text
                  style={[
                    styles.zoomLabel,
                    activePreset === i && styles.zoomLabelActive,
                  ]}
                >
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </GestureDetector>

      {/* Bottom controls */}
      <View style={styles.controls}>
        {/* Last photo thumbnail */}
        <TouchableOpacity style={styles.thumbnail} />

        {/* Shutter */}
        <TouchableOpacity
          style={styles.shutter}
          activeOpacity={0.8}
          onPress={handleCapture}
        >
          <View style={styles.shutterInner} />
        </TouchableOpacity>

        {/* Flip camera */}
        <TouchableOpacity
          style={styles.flipBtn}
          onPress={() => setFacing((f) => (f === "back" ? "front" : "back"))}
          activeOpacity={0.7}
        >
          <Text style={styles.flipIcon}>↺</Text>
        </TouchableOpacity>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000",
  },

  // Viewfinder
  viewfinder: {
    flex: 1,
    overflow: "hidden",
    backgroundColor: "#000",
  },

  // Rule of thirds
  grid: {
    ...StyleSheet.absoluteFillObject,
  },
  gridLine: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  gridLineH: {
    left: 0,
    right: 0,
    height: 0.5,
  },
  gridLineV: {
    top: 0,
    bottom: 0,
    width: 0.5,
  },

  // Corner brackets
  corner: {
    position: "absolute",
    width: 20,
    height: 20,
  },
  cornerTL: {
    top: 20,
    left: 20,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: "#fff",
    borderTopLeftRadius: 2,
  },
  cornerTR: {
    top: 20,
    right: 20,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: "#fff",
    borderTopRightRadius: 2,
  },
  cornerBL: {
    bottom: 60,
    left: 20,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: "#fff",
    borderBottomLeftRadius: 2,
  },
  cornerBR: {
    bottom: 60,
    right: 20,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: "#fff",
    borderBottomRightRadius: 2,
  },

  // Focus ring
  focusRing: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#FFD60A",
  },

  // Top bar
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 56 : 16,
  },
  topRight: {
    flexDirection: "row",
    gap: 8,
  },
  topBtn: {
    backgroundColor: "rgba(0,0,0,0.45)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  topBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },

  // Zoom bar
  zoomBar: {
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 4,
  },
  zoomBtnWrap: {
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  zoomLabel: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 13,
    fontWeight: "500",
  },
  zoomLabelActive: {
    color: "#FFD60A",
    fontWeight: "700",
  },

  // Bottom controls
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 32,
    paddingVertical: 24,
    backgroundColor: "#000",
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: "#1C1C1E",
    borderWidth: 2,
    borderColor: "#fff",
  },
  shutter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 3,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  shutterInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#fff",
  },
  flipBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#1C1C1E",
    alignItems: "center",
    justifyContent: "center",
  },
  flipIcon: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "300",
  },

  // Permission screen
  permissionWrap: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 12,
  },
  permissionText: {
    fontSize: 15,
    color: "#8E8E93",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  permissionBtn: {
    backgroundColor: "#0A84FF",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  permissionBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
