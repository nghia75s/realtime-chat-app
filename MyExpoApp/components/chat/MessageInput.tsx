import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Modal, Text, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MessageInputProps {
  text: string;
  setText: (text: string) => void;
  onSend: () => void;
  isPending: boolean;
}

export default function MessageInput({ text, setText, onSend, isPending }: MessageInputProps) {
  const [showAttachMenu, setShowAttachMenu] = useState(false);

  const isTyping = text.trim().length > 0;

  const handleSend = () => {
    if (isTyping && !isPending) {
      onSend();
    }
  };

  const renderAttachMenu = () => {
    return (
      <Modal visible={showAttachMenu} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setShowAttachMenu(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.attachMenuContainer}>
                <View style={styles.menuRow}>
                  {/* Camera */}
                  <TouchableOpacity style={styles.menuItem} onPress={() => setShowAttachMenu(false)}>
                    <View style={[styles.menuIconCircle, { backgroundColor: '#FF3B30' }]}>
                      <Ionicons name="camera" size={28} color="#FFF" />
                    </View>
                    <Text style={styles.menuItemText}>Camera</Text>
                  </TouchableOpacity>
                  
                  {/* Record */}
                  <TouchableOpacity style={styles.menuItem} onPress={() => setShowAttachMenu(false)}>
                    <View style={[styles.menuIconCircle, { backgroundColor: '#00A3FF' }]}>
                      <Ionicons name="mic" size={28} color="#FFF" />
                    </View>
                    <Text style={styles.menuItemText}>Record</Text>
                  </TouchableOpacity>

                  {/* Contact */}
                  <TouchableOpacity style={styles.menuItem} onPress={() => setShowAttachMenu(false)}>
                    <View style={[styles.menuIconCircle, { backgroundColor: '#FF9500' }]}>
                      <Ionicons name="person" size={28} color="#FFF" />
                    </View>
                    <Text style={styles.menuItemText}>Contact</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.menuRow}>
                  {/* Gallery */}
                  <TouchableOpacity style={styles.menuItem} onPress={() => setShowAttachMenu(false)}>
                    <View style={[styles.menuIconCircle, { backgroundColor: '#FFCC00' }]}>
                      <Ionicons name="image" size={28} color="#FFF" />
                    </View>
                    <Text style={styles.menuItemText}>Gallery</Text>
                  </TouchableOpacity>
                  
                  {/* Location */}
                  <TouchableOpacity style={styles.menuItem} onPress={() => setShowAttachMenu(false)}>
                    <View style={[styles.menuIconCircle, { backgroundColor: '#34C759' }]}>
                      <Ionicons name="location" size={28} color="#FFF" />
                    </View>
                    <Text style={styles.menuItemText}>My Location</Text>
                  </TouchableOpacity>

                  {/* Document */}
                  <TouchableOpacity style={styles.menuItem} onPress={() => setShowAttachMenu(false)}>
                    <View style={[styles.menuIconCircle, { backgroundColor: '#5856D6' }]}>
                      <Ionicons name="document-text" size={28} color="#FFF" />
                    </View>
                    <Text style={styles.menuItemText}>Document</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      {renderAttachMenu()}
      
      <TouchableOpacity 
        style={styles.plusBtn} 
        onPress={() => setShowAttachMenu(true)}
      >
        <Ionicons name="add" size={32} color="#00A3FF" />
      </TouchableOpacity>

      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Type a message ..."
          placeholderTextColor="#A0A0A0"
          multiline
        />
        
        {/* Only show inner icons when NOT typing */}
        {!isTyping && (
          <View style={styles.innerIcons}>
            <TouchableOpacity style={styles.innerIconBtn}>
              <Ionicons name="camera-outline" size={24} color="#A0A0A0" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.innerIconBtn}>
              <Ionicons name="attach-outline" size={24} color="#A0A0A0" style={{ transform: [{ rotate: '-45deg' }] }} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <TouchableOpacity 
        style={[styles.actionBtn, isPending && styles.actionBtnDisabled]} 
        onPress={handleSend}
        disabled={isPending}
      >
        <Ionicons 
          name={isTyping ? "send" : "mic"} 
          size={isTyping ? 20 : 24} 
          color="#FFF" 
          style={isTyping ? { marginLeft: 4 } : {}}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  plusBtn: {
    paddingBottom: 8,
    paddingRight: 8,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F2F4F6',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginRight: 12,
    minHeight: 48,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    fontSize: 16,
    color: '#333',
    paddingTop: 12,
    paddingBottom: 12,
  },
  innerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 8,
    paddingLeft: 4,
  },
  innerIconBtn: {
    marginLeft: 8,
  },
  actionBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#00A3FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#00A3FF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  actionBtnDisabled: {
    opacity: 0.5,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  attachMenuContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingVertical: 30,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
    marginBottom: 80, // Offset above the input bar
    marginHorizontal: 12,
    borderRadius: 24,
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  menuItem: {
    alignItems: 'center',
    width: 80,
  },
  menuIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItemText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
    textAlign: 'center',
  },
});
