import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar, Platform , useColorScheme } from 'react-native';
import { Colors } from '../constants/Theme';
import { Ionicons } from '@expo/vector-icons';

export default function ApprovalScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

  const [approvalTab, setApprovalTab] = useState('leaves');

  return (
    <View style={{'flex': 1}}>
      
      <View style={{'backgroundColor': theme.background, 'paddingHorizontal': 16, 'paddingVertical': 12}}>
        <View style={{'flexDirection': 'row', 'alignItems': 'center', 'justifyContent': 'space-between', 'marginBottom': 6}}>
          <Text style={{'fontSize': 24, 'fontWeight': 'bold', 'color': theme.text}}>Approvals</Text>
          <View style={{'width': 32, 'height': 32, 'backgroundColor': theme.card, 'borderRadius': 9999, 'alignItems': 'center', 'justifyContent': 'center'}}>
            <Ionicons name="notifications" size={16} color="#6B7280" />
          </View>
        </View>
        
        {/* Tabs */}
        <View style={{'flexDirection': 'row'}}>
          <TouchableOpacity 
            style={{'marginRight': 24, 'paddingBottom': 8}}
            onPress={() => setApprovalTab('leaves')}
          >
            <Text >Team Leaves</Text>
            {approvalTab === 'leaves' && (
              <View style={{'marginTop': 8}} />
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={{'paddingBottom': 8}}
            onPress={() => setApprovalTab('expenses')}
          >
            <Text >Team Expenses</Text>
            {approvalTab === 'expenses' && (
              <View style={{'marginTop': 8}} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={{'flex': 1, 'paddingHorizontal': 16, 'paddingVertical': 16, backgroundColor: theme.bodyBackgroundColor}}>
        {approvalTab === 'leaves' ? (
          <>
            {/* Leave Request Card */}
            <View style={{'backgroundColor': theme.background, 'borderRadius': 16, 'padding': 16, 'marginBottom': 16}}>
              <View style={{'flexDirection': 'row', 'alignItems': 'center', 'justifyContent': 'space-between', 'marginBottom': 12}}>
                <View style={{'flex': 1}}>
                  <Text style={{'fontSize': 18, 'fontWeight': 'bold', 'color': theme.text, 'marginBottom': 4}}>HR/LAP/2025-00086</Text>
                  <Text style={{'color': theme.secondary, 'fontSize': 14, 'marginBottom': 8}}>2025-10-01</Text>
                  <View style={{'flexDirection': 'row', 'alignItems': 'center', 'marginBottom': 12}}>
                    <View style={{'width': 8, 'height': 8, 'borderRadius': 9999, 'marginRight': 8}} />
                    <Text style={{'color': theme.secondary, 'fontSize': 14}}>Leave Without Pay</Text>
                  </View>
                  <View style={{'flexDirection': 'row', 'alignItems': 'center'}}>
                    <Ionicons name="umbrella" size={16} color="#F59E0B" />
                    <Text style={{'color': theme.secondary, 'fontSize': 14, 'marginLeft': 8}}>From: 2025-10-01 - To: 2025-10-03</Text>
                  </View>
                </View>
                <View style={{'flexDirection': 'row', 'alignItems': 'center'}}>
                  <View style={{'paddingHorizontal': 12, 'paddingVertical': 4, 'borderRadius': 9999, 'marginRight': 12}}>
                    <View style={{'flexDirection': 'row', 'alignItems': 'center'}}>
                      <View style={{'width': 8, 'height': 8, 'borderRadius': 9999, 'marginRight': 4}} />
                      <Text style={{'fontSize': 12, 'fontWeight': '600'}}>Open</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#6B7280" />
                </View>
              </View>
            </View>

            {/* Empty State */}
            <View style={{'alignItems': 'center', 'justifyContent': 'center', 'paddingVertical': 32}}>
              <Text style={{'color': theme.secondary, 'fontSize': 18}}>That's all you got.</Text>
            </View>
          </>
        ) : (
          <>
            {/* Expense Card 1 */}
            <View style={{'backgroundColor': theme.background, 'borderRadius': 16, 'padding': 16, 'marginBottom': 16}}>
              <View style={{'flexDirection': 'row', 'alignItems': 'center', 'justifyContent': 'space-between', 'marginBottom': 12}}>
                <View style={{'flex': 1}}>
                  <Text style={{'fontSize': 18, 'fontWeight': 'bold', 'color': theme.text, 'marginBottom': 4}}>John Doe</Text>
                  <Text style={{'color': theme.secondary, 'fontSize': 14, 'marginBottom': 8}}>2025-07-19</Text>
                  <View style={{'flexDirection': 'row', 'alignItems': 'center', 'marginBottom': 8}}>
                    <View style={{'width': 8, 'height': 8, 'borderRadius': 9999, 'marginRight': 8}} />
                    <Text style={{'color': theme.secondary, 'fontSize': 14}}>Travel</Text>
                  </View>
                  <Text style={{'color': theme.primary, 'fontSize': 14, 'fontWeight': '600'}}>Total Expenses 1</Text>
                  <Text style={{'color': theme.primary, 'fontSize': 14, 'fontWeight': '600'}}>Total Amount ₹ 500.00</Text>
                </View>
                <View style={{'flexDirection': 'row', 'alignItems': 'center'}}>
                  <View style={{'paddingHorizontal': 12, 'paddingVertical': 4, 'borderRadius': 9999, 'marginRight': 12}}>
                    <Text style={{'fontSize': 12, 'fontWeight': '600'}}>Pending</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#6B7280" />
                </View>
              </View>
            </View>

            {/* Expense Card 2 */}
            <View style={{'backgroundColor': theme.background, 'borderRadius': 16, 'padding': 16, 'marginBottom': 16}}>
              <View style={{'flexDirection': 'row', 'alignItems': 'center', 'justifyContent': 'space-between', 'marginBottom': 12}}>
                <View style={{'flex': 1}}>
                  <Text style={{'fontSize': 18, 'fontWeight': 'bold', 'color': theme.text, 'marginBottom': 4}}>John Doe</Text>
                  <Text style={{'color': theme.secondary, 'fontSize': 14, 'marginBottom': 8}}>2025-07-19</Text>
                  <View style={{'flexDirection': 'row', 'alignItems': 'center', 'marginBottom': 8}}>
                    <View style={{'width': 8, 'height': 8, 'borderRadius': 9999, 'marginRight': 8}} />
                    <Text style={{'color': theme.secondary, 'fontSize': 14}}>Medical</Text>
                  </View>
                  <Text style={{'color': theme.primary, 'fontSize': 14, 'fontWeight': '600'}}>Total Expenses 2</Text>
                  <Text style={{'color': theme.primary, 'fontSize': 14, 'fontWeight': '600'}}>Total Amount ₹ 255.00</Text>
                </View>
                <View style={{'flexDirection': 'row', 'alignItems': 'center'}}>
                  <View style={{'paddingHorizontal': 12, 'paddingVertical': 4, 'borderRadius': 9999, 'marginRight': 12}}>
                    <Text style={{'fontSize': 12, 'fontWeight': '600'}}>Pending</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#6B7280" />
                </View>
              </View>
            </View>

            {/* Expense Card 3 */}
            <View style={{'backgroundColor': theme.background, 'borderRadius': 16, 'padding': 16, 'marginBottom': 16}}>
              <View style={{'flexDirection': 'row', 'alignItems': 'center', 'justifyContent': 'space-between', 'marginBottom': 12}}>
                <View style={{'flex': 1}}>
                  <Text style={{'fontSize': 18, 'fontWeight': 'bold', 'color': theme.text, 'marginBottom': 4}}>John Doe</Text>
                  <Text style={{'color': theme.secondary, 'fontSize': 14, 'marginBottom': 8}}>2025-07-19</Text>
                  <View style={{'flexDirection': 'row', 'alignItems': 'center', 'marginBottom': 8}}>
                    <View style={{'width': 8, 'height': 8, 'borderRadius': 9999, 'marginRight': 8}} />
                    <Text style={{'color': theme.secondary, 'fontSize': 14}}>Food</Text>
                  </View>
                  <Text style={{'color': theme.primary, 'fontSize': 14, 'fontWeight': '600'}}>Total Expenses 1</Text>
                  <Text style={{'color': theme.primary, 'fontSize': 14, 'fontWeight': '600'}}>Total Amount ₹ 250.00</Text>
                </View>
                <View style={{'flexDirection': 'row', 'alignItems': 'center'}}>
                  <View style={{'paddingHorizontal': 12, 'paddingVertical': 4, 'borderRadius': 9999, 'marginRight': 12}}>
                    <Text style={{'fontSize': 12, 'fontWeight': '600'}}>Pending</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#6B7280" />
                </View>
              </View>
            </View>
          </>
        )}

        {/* Bottom spacing */}
        <View style={{'height': 96}} />
      </ScrollView>
    </View>
  );
}

