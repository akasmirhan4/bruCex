import { useTheme, useNavigation, DrawerActions } from "@react-navigation/native";
import * as React from "react";
import { SafeAreaView, View } from "react-native";
import { IconButton, Subheading, Text } from "react-native-paper";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { Fragment } from "react";

export default function Appbar() {
	const colors = useTheme().colors;
	const navigation = useNavigation();
	return (
		<View>
			<SafeAreaView style={{ flex: 0, backgroundColor: colors.card }} />
			<SafeAreaView style={{ flex: 0 }}>
				<View
					style={{
						width: "100%",
						height: 45,
						backgroundColor: colors.card,
						justifyContent: "center",
						alignItems: "center",
						flexDirection: "row",
						paddingHorizontal: 4,
					}}
				>
					<View style={{ flex: 1, alignItems: "center", flexDirection: "row" }}>
						<IconButton
							icon="account-circle"
							size={28}
							color={colors.primary}
							onPress={() => {
								Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
								navigation.dispatch(DrawerActions.openDrawer());
							}}
						/>
					</View>
					<View style={{ flex: 1, justifyContent: "center", alignItems: "center", flexDirection: "row" }}>
						<Subheading>BruCex</Subheading>
						<Subheading> | </Subheading>
						<Subheading style={{ color: colors.primary }}>Demo</Subheading>
					</View>
					<View style={{ flex: 1, justifyContent: "flex-end", alignItems: "center", flexDirection: "row" }}>
						<IconButton icon="magnify" color={colors.caption} size={20} onPress={console.log} />
						<IconButton icon="scan-helper" color={colors.caption} size={20} onPress={console.log} />
					</View>
				</View>
			</SafeAreaView>
		</View>
	);
}
