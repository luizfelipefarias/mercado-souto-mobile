import React, { useState, useCallback, useEffect } from 'react';
import {
    View, 
    StyleSheet, 
    ScrollView, 
    TouchableOpacity, 
    Alert, 
    SafeAreaView, 
    Platform, 
    StatusBar,
    KeyboardAvoidingView,
    // Note: ActivityIndicator não precisa ser importado do React Native aqui
} from 'react-native';
// 🟢 CORREÇÃO AQUI: Adicionando ActivityIndicator
import { Text, TextInput, Button, HelperText, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../../../src/constants/theme';
import api from '../../../../src/services/api';
import { useAuth } from '../../../../src/context/AuthContext';
import Toast from 'react-native-toast-message';

export default function ChangePassword() {
    const router = useRouter();
    const { user, isGuest } = useAuth();
    const [loading, setLoading] = useState(false);

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    // 🟢 EFEITO DE SEGURANÇA: Redireciona se for convidado
    useEffect(() => {
        if (isGuest) {
            Toast.show({
                type: 'info',
                text1: 'Acesso Não Autorizado',
                text2: 'Faça login para alterar sua senha.',
                visibilityTime: 3000,
            });
            router.replace('/(auth)/login' as any);
        }
    }, [isGuest, router]);


    const hasErrors = () => newPassword.length > 0 && newPassword.length < 6;
    const passwordsMatch = () => newPassword === confirmPassword;

    const handleUpdatePassword = async () => {
        // ... (Validações)
        if (!newPassword || !confirmPassword) {
            Alert.alert('Atenção', 'Preencha a nova senha e a confirmação.');
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert('Senha fraca', 'A nova senha deve ter pelo menos 6 caracteres.');
            return;
        }

        if (!passwordsMatch()) {
            Alert.alert('Erro', 'As senhas não conferem.');
            return;
        }

        setLoading(true);

        try {
            const userId = user?.id;

            if (!userId) {
                throw new Error("ID de usuário não encontrado.");
            }
            
            // 1. Buscando dados atuais (necessário para o PUT completo, pois o endpoint exige todos os campos)
            const currentClientResponse = await api.get(`/api/client/${userId}`);
            const { name, email, cpf, phone } = currentClientResponse.data;

            // 2. Enviando a atualização (com a nova senha)
            await api.put(`/api/client/${userId}`, {
                name,
                email,
                cpf,
                phone,
                password: newPassword
            });

            Toast.show({ type: 'success', text1: 'Sucesso!', text2: 'Sua senha foi alterada.' });
            
            Alert.alert('Sucesso', 'Sua senha foi alterada com sucesso!', [
                { text: 'OK', onPress: () => router.back() }
            ]);
            
        } catch (err: any) {
            console.error("Erro ao alterar senha:", err);
            const errorMsg =
                err.response?.data?.message || 'Não foi possível alterar a senha. Tente novamente.';
            Toast.show({ type: 'error', text1: 'Erro ao Atualizar', text2: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    // 💡 Renderiza um indicador de carregamento se o redirecionamento for ativado
    if (isGuest) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size={48} color={theme.colors.primary} />
            </View>
        );
    }
    
    return (
        <View style={styles.container}>
            <StatusBar
                barStyle="dark-content"
                backgroundColor={theme.colors.secondary}
            />

            <SafeAreaView style={styles.header}>
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
                    </TouchableOpacity>

                    <Text style={styles.headerTitle}>Alterar senha</Text>

                    <View style={{ width: 24 }} />
                </View>
            </SafeAreaView>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.content}>
                    <Text style={styles.description}>
                        Use uma senha forte que você ainda não utilizou neste app.
                    </Text>

                    <View style={styles.inputContainer}>
                        <TextInput
                            label="Nova senha"
                            mode="outlined"
                            value={newPassword}
                            onChangeText={setNewPassword}
                            secureTextEntry={!showNew}
                            activeOutlineColor={theme.colors.primary}
                            right={
                                <TextInput.Icon
                                    icon={showNew ? 'eye-off' : 'eye'}
                                    onPress={() => setShowNew(!showNew)}
                                />
                            }
                            style={styles.input}
                        />
                        <HelperText type="error" visible={hasErrors()}>
                            A senha deve ter no mínimo 6 caracteres.
                        </HelperText>
                    </View>

                    <View style={styles.inputContainer}>
                        <TextInput
                            label="Confirmar nova senha"
                            mode="outlined"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry={!showConfirm}
                            activeOutlineColor={theme.colors.primary}
                            error={newPassword !== '' && !passwordsMatch()}
                            right={
                                <TextInput.Icon
                                    icon={showConfirm ? 'eye-off' : 'eye'}
                                    onPress={() => setShowConfirm(!showConfirm)}
                                />
                            }
                            style={styles.input}
                        />
                        {newPassword !== '' && !passwordsMatch() && (
                            <HelperText type="error" visible>
                                As senhas não coincidem.
                            </HelperText>
                        )}
                    </View>

                    <Button
                        mode="contained"
                        onPress={handleUpdatePassword}
                        loading={loading}
                        disabled={loading || !newPassword || !confirmPassword || hasErrors() || !passwordsMatch()}
                        style={styles.button}
                        labelStyle={{ fontWeight: 'bold', fontSize: 16 }}
                    >
                        Salvar nova senha
                    </Button>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },

    header: {
        backgroundColor: theme.colors.secondary,
        paddingTop: Platform.OS === 'android' ? 30 : 0
    },

    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 15
    },

    headerTitle: { fontSize: 18, color: '#333', fontWeight: '500' },

    content: { padding: 20 },

    description: {
        color: '#666',
        fontSize: 14,
        marginBottom: 20,
        lineHeight: 20
    },

    inputContainer: { marginBottom: 10 },

    input: { backgroundColor: '#fff' },

    button: {
        marginTop: 20,
        backgroundColor: theme.colors.primary,
        borderRadius: 6,
        paddingVertical: 6
    }
});