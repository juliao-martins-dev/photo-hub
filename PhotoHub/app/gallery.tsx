import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  SafeAreaView,
} from 'react-native';

const { width } = Dimensions.get('window');
const CELL_SIZE = (width - 4) / 3;   // 3 columns with 2px gaps

// Camera icon SVG path — drawn inline via View shapes
function CameraIcon() {
  return (
    <View style={icon.wrap}>
      {/* Lens */}
      <View style={icon.lens} />
      {/* Viewfinder bump */}
      <View style={icon.bump} />
    </View>
  );
}

export default function GalleryScreen({ navigation, photos = [] }) {
  const renderPhoto = ({ item }) => (
    <TouchableOpacity
      style={styles.cell}
      activeOpacity={0.85}
      onPress={() => {/* handle photo preview */}}
    >
      <Image
        source={{ uri: item.image_url }}
        style={styles.cellImage}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <SafeAreaView style={styles.safe}>

        {/* Navigation header */}
        <View style={styles.header}>
          <Text style={styles.title}>My Photos</Text>
          <TouchableOpacity>
            <Text style={styles.selectBtn}>Select</Text>
          </TouchableOpacity>
        </View>

        {/* Photo grid */}
        <FlatList
          data={photos}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderPhoto}
          numColumns={3}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>No photos yet</Text>
              <Text style={styles.emptySubtext}>
                Tap the camera button to take your first shot
              </Text>
            </View>
          }
        />

      </SafeAreaView>

      {/* Fixed camera button */}
      <View style={styles.fabWrap} pointerEvents="box-none">
        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Camera')}
        >
          {/* Outer glow ring */}
          <View style={styles.fabGlow} />

          {/* Camera SVG icon */}
          <View style={styles.fabIcon}>
            <View style={styles.camBody}>
              <View style={styles.camLens} />
              <View style={styles.camBump} />
            </View>
          </View>

        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  safe: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.2,
  },
  selectBtn: {
    fontSize: 17,
    color: '#0A84FF',
  },

  // Grid
  grid: {
    gap: 2,
    paddingBottom: 120,   // space for FAB
  },
  row: {
    gap: 2,
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    backgroundColor: '#1C1C1E',
  },
  cellImage: {
    width: '100%',
    height: '100%',
  },

  // Empty state
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 120,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
  },

  // FAB
  fabWrap: {
    position: 'absolute',
    bottom: 48,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  fab: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#0A84FF',
    alignItems: 'center',
    justifyContent: 'center',
    // Layered shadow for depth
    shadowColor: '#0A84FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 12,
  },
  fabGlow: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 1.5,
    borderColor: 'rgba(10,132,255,0.3)',
  },

  // Camera icon built from Views
  fabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  camBody: {
    width: 28,
    height: 22,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  camLens: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  camBump: {
    position: 'absolute',
    top: -6,
    left: 6,
    width: 8,
    height: 5,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    borderWidth: 2,
    borderBottomWidth: 0,
    borderColor: '#fff',
  },
});

// Unused — kept for reference if switching to SVG via react-native-svg
const icon = StyleSheet.create({
  wrap:  { width: 28, height: 22 },
  lens:  { width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: '#fff' },
  bump:  { position: 'absolute', top: -5, left: 6, width: 8, height: 5, borderTopLeftRadius: 3, borderTopRightRadius: 3, borderWidth: 2, borderBottomWidth: 0, borderColor: '#fff' },
});