// Helper function to handle promo codes after signup
// This is a simpler approach that doesn't rely on database triggers

export const handlePromoCodeAfterSignup = async (supabase, userId, promoCode) => {
  if (!promoCode) return { success: true };
  
  try {
    // Simply update the user's profile with the promo code
    // The database will handle the rest via RLS and functions
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ promo_code_used: promoCode.toUpperCase() })
      .eq('id', userId);
    
    if (updateError) {
      console.error('Error saving promo code:', updateError);
      // Don't fail the signup if promo code can't be saved
      return { success: true, warning: 'Account created but promo code could not be applied' };
    }
    
    return { success: true, message: 'Promo code applied successfully' };
  } catch (error) {
    console.error('Error handling promo code:', error);
    // Don't fail the signup if promo code can't be saved
    return { success: true, warning: 'Account created but promo code could not be applied' };
  }
};