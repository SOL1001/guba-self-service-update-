import { Colors } from '../constants/Theme';
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Image,
  Platform,
  Modal,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Task, apiService } from '../services/api';

interface TaskDetailsScreenProps {
  task: Task;
  onBack: () => void;
}

export default function TaskDetailsScreen({ task, onBack }: TaskDetailsScreenProps) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

  const [showCommentSheet, setShowCommentSheet] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showProgressSheet, setShowProgressSheet] = useState(false);
  const [progressValue, setProgressValue] = useState(task.progress?.toString() || '0');
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'success' | 'error'>('success');
  const [modalMessage, setModalMessage] = useState('');

  const showModalMessage = (type: 'success' | 'error', message: string) => {

    setModalType(type);
    setModalMessage(message);
    setShowModal(true);
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) {
      showModalMessage('error', 'Please enter a comment');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await apiService.addComment('Task', task.name, commentText.trim());
      
      if (response.message === 'Comment added successfully') {
        showModalMessage('success', 'Comment added successfully!');
        setCommentText('');
        setShowCommentSheet(false);
        // Optionally refresh task data here
      } else {
        showModalMessage('error', response.message || 'Failed to add comment');
      }
    } catch (err) {
      console.error('Error adding comment:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to add comment. Please try again.';
      showModalMessage('error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProgress = async () => {
    const progressNum = parseInt(progressValue, 10);
    if (isNaN(progressNum) || progressNum < 0 || progressNum > 100) {
      showModalMessage('error', 'Please enter a valid progress percentage (0-100)');
      return;
    }

    try {
      setIsUpdatingProgress(true);
      const response = await apiService.updateTaskProgress(task.name, progressValue);

      console.log('Update Progress API Response:', JSON.stringify(response, null, 2));

      const message = response?.message || '';
      const isSuccess = message.toLowerCase().includes('success') || message.toLowerCase().includes('updated');

      if (isSuccess) {
        showModalMessage('success', 'Task progress updated successfully!');
        setShowProgressSheet(false);
        // Optionally refresh task data here if needed
      } else {
        const errorMessage = response?.message || 'Failed to update progress';
        showModalMessage('error', errorMessage);
      }
    } catch (err) {
      console.error('Error updating progress:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update progress. Please check your connection.';
      showModalMessage('error', errorMessage);
    } finally {
      setIsUpdatingProgress(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-orange-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'overdue':
        return 'bg-red-600';
      case 'completed':
        return 'bg-green-600';
      case 'open':
        return 'bg-blue-600';
      case 'in progress':
        return 'bg-yellow-600';
      default:
        return 'bg-gray-600';
    }
  };

  return (
    <View style={{'flex': 1, 'backgroundColor': theme.card}}>
      {/* Status Bar Spacer */}
      {/* <View style={{ 
        height: Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0,
        backgroundColor: 'white' 
      }} /> */}
      
      {/* Header */}
      <View style={{'backgroundColor': theme.background, 'paddingHorizontal': 16, 'paddingVertical': 12, 'flexDirection': 'row', 'alignItems': 'center', 'justifyContent': 'space-between'}}>
        <TouchableOpacity onPress={onBack} style={{'flexDirection': 'row', 'alignItems': 'center'}}>
          <Ionicons name="arrow-back" size={24} color="#2563EB" />
        </TouchableOpacity>
        
        <Text style={{'fontSize': 20, 'fontWeight': 'bold', 'color': theme.text}}>Task Details</Text>
        
        <TouchableOpacity style={{'width': 32, 'height': 32, 'borderRadius': 9999, 'alignItems': 'center', 'justifyContent': 'center'}}>
          <Ionicons name="ellipsis-vertical" size={16} color="#2563EB" />
        </TouchableOpacity>
      </View>

      <ScrollView style={{'flex': 1}} showsVerticalScrollIndicator={false}>
        <View style={{'padding': 16}}>
          {/* Task Header Card */}
          <View style={{'backgroundColor': theme.background, 'borderRadius': 16, 'padding': 24, 'marginBottom': 16, 'shadowColor': '#000', 'shadowOffset': {'width': 0, 'height': 1}, 'shadowOpacity': 0.05, 'shadowRadius': 2, 'elevation': 2}}>
            {/* Status and Priority Pills */}
            <View style={{'flexDirection': 'row', 'alignItems': 'center', 'marginBottom': 16}}>
              <View >
                <Ionicons name="arrow-down" size={14} color="white" />
                <Text style={{'color': '#fff', 'fontSize': 14, 'fontWeight': '600', 'marginLeft': 8}}>
                  {task.status}
                </Text>
              </View>
              <View >
                <View style={{'width': 8, 'height': 8, 'backgroundColor': theme.background, 'borderRadius': 9999, 'marginRight': 8}} />
                <Text style={{'color': '#fff', 'fontSize': 14, 'fontWeight': '600'}}>
                  {task.priority}
                </Text>
              </View>
            </View>

            {/* Task Name and Subject */}
            <Text style={{'fontSize': 24, 'fontWeight': 'bold', 'color': theme.text, 'marginBottom': 8}}>
              {task.name}
            </Text>
            <Text style={{'fontSize': 18, 'color': theme.secondary, 'marginBottom': 16}}>
              {task.subject}
            </Text>

            {/* Progress Section */}
            <View style={{'marginBottom': 16}}>
              <View style={{'flexDirection': 'row', 'alignItems': 'center', 'justifyContent': 'space-between', 'marginBottom': 8}}>
                <Text style={{'fontWeight': '600'}}>Progress</Text>
                <Text style={{'color': theme.primary, 'fontWeight': 'bold', 'fontSize': 18}}>
                  {task.progress}%
                </Text>
              </View>
              <View style={{'borderRadius': 9999, 'height': 12}}>
                <View 
                  style={{'borderRadius': 9999, 'height': 12}} 
                  style={{ width: `${task.progress}%` }} 
                />
              </View>
            </View>

            {/* Due Date */}
            {task.exp_end_date && (
              <View style={{'flexDirection': 'row', 'alignItems': 'center', 'marginBottom': 16}}>
                <Ionicons name="calendar" size={20} color="#2563EB" />
                <Text style={{'color': theme.primary, 'fontSize': 18, 'fontWeight': '600', 'marginLeft': 12}}>
                  Due: {task.exp_end_date}
                </Text>
              </View>
            )}
          </View>

          {/* Description Section */}
          {task.description && (
            <View style={{'backgroundColor': theme.background, 'borderRadius': 16, 'padding': 24, 'marginBottom': 16, 'shadowColor': '#000', 'shadowOffset': {'width': 0, 'height': 1}, 'shadowOpacity': 0.05, 'shadowRadius': 2, 'elevation': 2}}>
              <Text style={{'fontSize': 18, 'fontWeight': 'bold', 'color': theme.text, 'marginBottom': 12}}>Description</Text>
              <Text style={{'color': theme.secondary}}>
                {task.description}
              </Text>
            </View>
          )}

          {/* Project Information */}
          {task.project_name && (
            <View style={{'backgroundColor': theme.background, 'borderRadius': 16, 'padding': 24, 'marginBottom': 16, 'shadowColor': '#000', 'shadowOffset': {'width': 0, 'height': 1}, 'shadowOpacity': 0.05, 'shadowRadius': 2, 'elevation': 2}}>
              <Text style={{'fontSize': 18, 'fontWeight': 'bold', 'color': theme.text, 'marginBottom': 12}}>Project</Text>
              <View style={{'flexDirection': 'row', 'alignItems': 'center'}}>
                <View style={{'width': 40, 'height': 40, 'borderRadius': 9999, 'alignItems': 'center', 'justifyContent': 'center', 'marginRight': 12}}>
                  <Ionicons name="folder" size={20} color="#2563EB" />
                </View>
                <View>
                  <Text style={{'color': theme.text, 'fontWeight': '600'}}>{task.project_name}</Text>
                  <Text style={{'color': theme.secondary, 'fontSize': 14}}>{task.project}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Assigned By Section */}
          <View style={{'backgroundColor': theme.background, 'borderRadius': 16, 'padding': 24, 'marginBottom': 16, 'shadowColor': '#000', 'shadowOffset': {'width': 0, 'height': 1}, 'shadowOpacity': 0.05, 'shadowRadius': 2, 'elevation': 2}}>
            <Text style={{'fontSize': 18, 'fontWeight': 'bold', 'color': theme.text, 'marginBottom': 12}}>Created By</Text>
            <View style={{'flexDirection': 'row', 'alignItems': 'center'}}>
              <View style={{'width': 48, 'height': 48, 'borderRadius': 9999, 'alignItems': 'center', 'justifyContent': 'center', 'marginRight': 16}}>
                {task.assigned_by.user_image ? (
                  <Image 
                    source={{ uri: task.assigned_by.user_image }} 
                    style={{'width': 48, 'height': 48, 'borderRadius': 9999}}
                  />
                ) : (
                  <Ionicons name="person" size={24} color="#6B7280" />
                )}
              </View>
              <View style={{'flex': 1}}>
                <Text style={{'color': theme.text, 'fontWeight': '600', 'fontSize': 18}}>
                  {task.assigned_by.full_name}
                </Text>
                <Text style={{'color': theme.secondary}}>{task.assigned_by.name}</Text>
              </View>
            </View>
          </View>

          {/* Assigned To Section */}
          {task.assigned_to.length > 0 && (
            <View style={{'backgroundColor': theme.background, 'borderRadius': 16, 'padding': 24, 'marginBottom': 16, 'shadowColor': '#000', 'shadowOffset': {'width': 0, 'height': 1}, 'shadowOpacity': 0.05, 'shadowRadius': 2, 'elevation': 2}}>
              <Text style={{'fontSize': 18, 'fontWeight': 'bold', 'color': theme.text, 'marginBottom': 12}}>Assigned To</Text>
              {task.assigned_to.map((user, index) => (
                <View key={index} style={{'flexDirection': 'row', 'alignItems': 'center', 'marginBottom': 12}}>
                  <View style={{'width': 40, 'height': 40, 'borderRadius': 9999, 'alignItems': 'center', 'justifyContent': 'center', 'marginRight': 12}}>
                    {user.user_image ? (
                      <Image 
                        source={{ uri: user.user_image }} 
                        style={{'width': 40, 'height': 40, 'borderRadius': 9999}}
                      />
                    ) : (
                      <Ionicons name="person" size={20} color="#6B7280" />
                    )}
                  </View>
                  <View style={{'flex': 1}}>
                    <Text style={{'color': theme.text, 'fontWeight': '600'}}>
                      {user.full_name}
                    </Text>
                    <Text style={{'color': theme.secondary, 'fontSize': 14}}>{user.name}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Comments Section */}
          <View style={{'backgroundColor': theme.background, 'borderRadius': 16, 'padding': 24, 'marginBottom': 16, 'shadowColor': '#000', 'shadowOffset': {'width': 0, 'height': 1}, 'shadowOpacity': 0.05, 'shadowRadius': 2, 'elevation': 2}}>
            <View style={{'flexDirection': 'row', 'alignItems': 'center', 'justifyContent': 'space-between', 'marginBottom': 12}}>
              <Text style={{'fontSize': 18, 'fontWeight': 'bold', 'color': theme.text}}>Comments</Text>
              <View style={{'flexDirection': 'row', 'alignItems': 'center'}}>
                <Ionicons name="chatbubble" size={16} color="#2563EB" />
                <Text style={{'color': theme.primary, 'fontWeight': '600', 'marginLeft': 4}}>
                  {task.num_comments}
                </Text>
              </View>
            </View>
            
            {task.comments && task.comments.length > 0 ? (
              <View>
                {task.comments.map((comment, index) => {
                  // Handle both string and object comment formats
                  const commentText = typeof comment === 'string' ? comment : (comment.comment || comment.content || '');
                  const commentBy = typeof comment === 'object' ? (comment.comment_by || comment.commented || '') : '';
                  const commentDate = typeof comment === 'object' ? (comment.creation || '') : '';
                  
                  return (
                    <View key={index} style={{'paddingLeft': 16, 'paddingVertical': 12, 'marginBottom': 12}}>
                      {commentBy && (
                        <View style={{'flexDirection': 'row', 'alignItems': 'center', 'marginBottom': 8}}>
                          <Text style={{'color': theme.text, 'fontWeight': '600', 'fontSize': 14}}>{commentBy}</Text>
                          {commentDate && (
                            <Text style={{'color': theme.secondary, 'fontSize': 12, 'marginLeft': 8}}>{commentDate}</Text>
                          )}
                        </View>
                      )}
                      <Text style={{'color': theme.secondary}}>{commentText}</Text>
                    </View>
                  );
                })}
              </View>
            ) : (
              <Text style={{'color': theme.secondary, 'fontStyle': 'italic'}}>No comments yet</Text>
            )}
          </View>

          {/* Action Buttons */}
          <View style={{'flexDirection': 'row', 'marginBottom': 24}}>
            <TouchableOpacity
              style={{'flex': 1, 'paddingVertical': 16, 'borderRadius': 16, 'alignItems': 'center'}}
              onPress={() => setShowProgressSheet(true)}
            >
              <Text style={{'color': '#fff', 'fontWeight': '600', 'fontSize': 18}}>Update Progress</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={{'flex': 1, 'backgroundColor': theme.card, 'paddingVertical': 16, 'borderRadius': 16, 'alignItems': 'center'}}
              onPress={() => setShowCommentSheet(true)}
            >
              <Text style={{'fontWeight': '600', 'fontSize': 18}}>Add Comment</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Comment Bottom Sheet */}
      <Modal
        visible={showCommentSheet}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCommentSheet(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{'flex': 1}}
        >
          <TouchableOpacity
            style={{'flex': 1}}
            activeOpacity={1}
            onPress={() => setShowCommentSheet(false)}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
              style={{'backgroundColor': theme.background, 'position': 'absolute'}}
            >
              <View style={{'padding': 24}}>
                {/* Handle Bar */}
                <View style={{'width': 48, 'height': 4, 'borderRadius': 9999, 'marginBottom': 16}} />
                
                {/* Header */}
                <View style={{'flexDirection': 'row', 'alignItems': 'center', 'justifyContent': 'space-between', 'marginBottom': 16}}>
                  <Text style={{'fontSize': 20, 'fontWeight': 'bold', 'color': theme.text}}>Add Comment</Text>
                  <TouchableOpacity onPress={() => setShowCommentSheet(false)}>
                    <Ionicons name="close" size={24} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                {/* Comment Input */}
                <TextInput
                  style={{'backgroundColor': theme.card, 'borderRadius': 12, 'padding': 16, 'color': theme.text, 'fontSize': 16}}
                  placeholder="Write your comment here..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={5}
                  value={commentText}
                  onChangeText={setCommentText}
                  style={{ textAlignVertical: 'top' }}
                  editable={!isSubmitting}
                />

                {/* Submit Button */}
                <TouchableOpacity
                  
                  onPress={handleAddComment}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={{'color': '#fff', 'fontWeight': '600', 'fontSize': 18}}>Submit Comment</Text>
                  )}
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      {/* Progress Bottom Sheet */}
      <Modal
        visible={showProgressSheet}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowProgressSheet(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{'flex': 1}}
        >
          <TouchableOpacity
            style={{'flex': 1}}
            activeOpacity={1}
            onPress={() => setShowProgressSheet(false)}
          >
            <TouchableOpacity
              style={{'backgroundColor': theme.background}}
              style={{ height: '50%' }}
              activeOpacity={1}
              onPress={() => {}}
            >
              <View style={{'padding': 24}}>
                {/* Handle Bar */}
                <View style={{'width': 48, 'height': 4, 'borderRadius': 9999, 'marginBottom': 16}} />

                {/* Header */}
                <View style={{'flexDirection': 'row', 'alignItems': 'center', 'justifyContent': 'space-between', 'marginBottom': 24}}>
                  <Text style={{'fontSize': 20, 'fontWeight': 'bold', 'color': theme.text}}>Update Progress</Text>
                  <TouchableOpacity onPress={() => setShowProgressSheet(false)}>
                    <Ionicons name="close" size={24} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                {/* Current Progress Display */}
                <View style={{'backgroundColor': theme.card, 'borderRadius': 12, 'padding': 16, 'marginBottom': 24}}>
                  <Text style={{'fontSize': 14, 'fontWeight': '600', 'color': theme.secondary, 'marginBottom': 8}}>Current Progress</Text>
                  <View style={{'flexDirection': 'row', 'alignItems': 'center'}}>
                    <View style={{'flex': 1, 'borderRadius': 9999, 'height': 12, 'marginRight': 12}}>
                      <View
                        style={{'height': 12, 'borderRadius': 9999}}
                        style={{ width: `${Math.min(parseInt(progressValue) || 0, 100)}%` }}
                      />
                    </View>
                    <Text style={{'fontSize': 18, 'fontWeight': 'bold', 'color': theme.primary}}>
                      {Math.min(parseInt(progressValue) || 0, 100)}%
                    </Text>
                  </View>
                </View>

                {/* Progress Input */}
                <View style={{'marginBottom': 24}}>
                  <Text style={{'fontSize': 14, 'fontWeight': '600', 'marginBottom': 8}}>Progress Percentage (0-100)*</Text>
                  <View style={{'flexDirection': 'row', 'alignItems': 'center', 'backgroundColor': theme.card, 'borderRadius': 12, 'paddingHorizontal': 16, 'paddingVertical': 16, 'borderColor': theme.border}}>
                    <Ionicons name="stats-chart-outline" size={20} color="#6B7280" style={{ marginRight: 12 }} />
                    <TextInput
                      value={progressValue}
                      onChangeText={(text) => {
                        // Only allow numeric input and limit to 0-100
                        const numValue = text.replace(/[^0-9]/g, '');
                        const intValue = parseInt(numValue, 10);
                        if (!isNaN(intValue) && intValue <= 100) {
                          setProgressValue(numValue);
                        } else if (numValue === '') {
                          setProgressValue('');
                        }
                      }}
                      placeholder="Enter progress (0-100)"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="numeric"
                      style={{'flex': 1, 'fontSize': 16}}
                      style={{ fontSize: 16, color: '#1F2937' }}
                      maxLength={3}
                    />
                    <Text style={{'color': theme.secondary, 'fontWeight': '600', 'marginLeft': 8}}>%</Text>
                  </View>
                  <Text style={{'fontSize': 12, 'color': theme.secondary, 'marginTop': 8}}>
                    Enter a value between 0 and 100 to update the task progress
                  </Text>
                </View>

                {/* Action Buttons */}
                <View style={{'flexDirection': 'row'}}>
                  <TouchableOpacity
                    style={{'flex': 1, 'backgroundColor': theme.card, 'paddingVertical': 16, 'borderRadius': 12, 'alignItems': 'center', 'marginRight': 12}}
                    onPress={() => setShowProgressSheet(false)}
                  >
                    <Text style={{'fontWeight': '600', 'fontSize': 18}}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{'flex': 1, 'paddingVertical': 16, 'borderRadius': 12, 'alignItems': 'center'}}
                    onPress={handleUpdateProgress}
                    disabled={isUpdatingProgress}
                  >
                    {isUpdatingProgress ? (
                      <View style={{'flexDirection': 'row', 'alignItems': 'center'}}>
                        <ActivityIndicator size="small" color="white" />
                        <Text style={{'color': '#fff', 'fontWeight': '600', 'fontSize': 18, 'marginLeft': 8}}>Updating...</Text>
                      </View>
                    ) : (
                      <Text style={{'color': '#fff', 'fontWeight': '600', 'fontSize': 18}}>Update Progress</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      {/* Success/Error Modal */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={{'flex': 1, 'alignItems': 'center', 'justifyContent': 'center', 'paddingHorizontal': 16}}>
          <View style={{'backgroundColor': theme.background, 'borderRadius': 16, 'padding': 24}}>
            {/* Icon */}
            <View style={{'alignItems': 'center', 'marginBottom': 16}}>
              <View >
                <Ionicons 
                  name={modalType === 'success' ? 'checkmark-circle' : 'close-circle'} 
                  size={48} 
                  color={modalType === 'success' ? '#10B981' : '#EF4444'} 
                />
              </View>
            </View>

            {/* Message */}
            <Text >
              {modalType === 'success' ? 'Success' : 'Error'}
            </Text>
            <Text style={{'textAlign': 'center', 'color': theme.secondary, 'marginBottom': 24}}>
              {modalMessage}
            </Text>

            {/* Close Button */}
            <TouchableOpacity
              onPress={() => setShowModal(false)}
              
            >
              <Text style={{'color': '#fff', 'textAlign': 'center', 'fontWeight': '600', 'fontSize': 16}}>
                OK
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
