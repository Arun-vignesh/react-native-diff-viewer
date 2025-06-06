import React, { useCallback, useMemo } from 'react';
import { View, StyleSheet, FlatList, Text, Platform } from 'react-native';
import type { DiffViewerProps } from '../types';
import { DIFF_VIEWER_STRINGS, DIFF_TYPES, DIFF_SIDES } from '../constants';
import { diffJSON } from '../utils/diffHelper';

const DEFAULT_THEME = {
  backgroundColor: '#FFFFFF',
  textColor: '#000000',
  diffAddedColor: '#E6FFE6',
  diffRemovedColor: '#FFE6E6',
  diffUnchangedColor: '#F5F5F5',
  diffChangedColor: '#FFF3E6'
};

interface DiffRowProps {
  item: {
    key: string;
    type: typeof DIFF_TYPES[keyof typeof DIFF_TYPES];
    oldValue?: string;
    newValue?: string;
  };
  index: number;
  theme: typeof DEFAULT_THEME;
  side: typeof DIFF_SIDES[keyof typeof DIFF_SIDES];
}

const getBackgroundColor = (type: DiffRowProps['item']['type'], theme: typeof DEFAULT_THEME) => {
  switch (type) {
    case DIFF_TYPES.ADDED:
      return theme.diffAddedColor;
    case DIFF_TYPES.REMOVED:
      return theme.diffRemovedColor;
    case DIFF_TYPES.CHANGED:
      return theme.diffChangedColor;
    default:
      return theme.diffUnchangedColor;
  }
};

const DiffRow = React.memo(({ item, index, theme, side }: DiffRowProps) => {
  const value = side === DIFF_SIDES.LEFT ? item.oldValue : item.newValue;
  if (!value) return null;

  return (
    <View style={[styles.rowContainer, { backgroundColor: theme.backgroundColor }]}>
      <View style={styles.rowNumber}>
        <Text style={[styles.lineNumber, { color: theme.textColor }]}>{index + 1}</Text>
      </View>
      <View style={[styles.row, { backgroundColor: getBackgroundColor(item.type, theme) }]}>
        <Text style={[styles.key, { color: theme.textColor }]} numberOfLines={1}>{`${item.key}: ${value}`}</Text>
      </View>
    </View>
  );
});

const DiffList = React.memo(({ 
  data, 
  theme,
  side,
  title
}: { 
  data: DiffRowProps['item'][];
  theme: typeof DEFAULT_THEME;
  side: typeof DIFF_SIDES[keyof typeof DIFF_SIDES];
  title: string;
}) => {
  const renderItem = useCallback(({ item, index }: { item: DiffRowProps['item']; index: number }) => (
    <DiffRow item={item} index={index} theme={theme} side={side} />
  ), [theme, side]);

  const keyExtractor = useCallback((_: unknown, index: number) => index.toString(), []);

  const getItemLayout = useCallback((_: unknown, index: number) => ({
    length: 40,
    offset: 40 * index,
    index
  }), []);

  return (
    <View style={[styles.listContainer, { backgroundColor: theme.backgroundColor }]}>
      <View style={styles.headerContainer}>
        <Text style={[styles.headerText, { color: theme.textColor }]}>
          {title}
        </Text>
      </View>
      {Platform.OS === 'web' ? (
        <View>
          {data.map((item, index) => renderItem({ item, index }))}
        </View>
      ) : (
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          getItemLayout={getItemLayout}
          removeClippedSubviews={true}
          maxToRenderPerBatch={20}
          windowSize={10}
          initialNumToRender={20}
        />
      )}
    </View>
  );
});

const JsonDiffViewer: React.FC<DiffViewerProps> = ({ 
  data1,
  data2,
  theme: customTheme,
  oldVersionTitle = DIFF_VIEWER_STRINGS.OLD_VERSION,
  newVersionTitle = DIFF_VIEWER_STRINGS.NEW_VERSION
}) => {
  const theme = { ...DEFAULT_THEME, ...customTheme };

  const diffResult = useMemo(() => {
    return diffJSON(data1, data2);
  }, [data1, data2]);

  return (
    <View style={styles.container}>
      <View style={styles.splitContainer}>
        <View style={styles.leftView}>
          <DiffList 
            data={diffResult} 
            theme={theme} 
            side={DIFF_SIDES.LEFT} 
            title={oldVersionTitle}
          />
        </View>
        <View style={styles.rightView}>
          <DiffList 
            data={diffResult} 
            theme={theme} 
            side={DIFF_SIDES.RIGHT} 
            title={newVersionTitle}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  splitContainer: {
    flex: 1,
    flexDirection: 'row'
  },
  leftView: {
    flex: 1,
    marginRight: 4
  },
  rightView: {
    flex: 1,
    marginLeft: 4
  },
  listContainer: {
    flex: 1,
    margin: 8,
    borderRadius: 10,
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.25)'
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
      }
    })
  },
  headerContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0'
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  rowContainer: {
    flexDirection: 'row',
    height: 40,
    overflow: 'hidden'
  },
  row: {
    flex: 1,
    padding: 5,
    flexDirection: 'row'
  },
  rowNumber: {
    width: 50,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 10
  },
  key: {
    fontSize: 16,
    flex: 1
  },
  lineNumber: {
    fontSize: 14
  }
});

const DiffViewer = React.memo(JsonDiffViewer);
export { DiffViewer };
export default DiffViewer; 