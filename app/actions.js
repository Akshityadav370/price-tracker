'use server';

import { createClient } from '@/utils/supabase/server';
import { scrapeProduct } from '@/lib/firecrawl';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { sendUpdateEmail } from '@/lib/updateEmail';

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/');
  redirect('/');
}

export async function addProduct(formData) {
  const url = formData.get('url');
  if (!url) return { error: 'URL is required' };

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: 'Not authenticated' };

    const { data: existingProduct } = await supabase
      .from('products')
      .select('id, current_price')
      .eq('user_id', user.id)
      .eq('url', url)
      .single();

    if (existingProduct) {
      if (error.code === '23505') {
        return { error: 'Product already being tracked' };
      }
      throw error;
    }

    const productData = await scrapeProduct(url);
    if (!productData.productName || !productData.currentPrice) {
      return { error: 'Could not extract product information' };
    }

    const price = parseFloat(productData.currentPrice);
    const currency = productData.currencyCode || 'USD';

    // 1️⃣ INSERT product (fail if exists)
    const { data: product, error } = await supabase
      .from('products')
      .insert({
        user_id: user.id,
        url,
        name: productData.productName,
        current_price: price,
        currency,
        image_url: productData.productImageUrl,
      })
      .select()
      .single();

    if (error) {
      // Product already exists
      if (error.code === '23505') {
        return { error: 'Product already being tracked' };
      }
      throw error;
    }

    // 2️⃣ ALWAYS insert initial price history
    const result = await supabase.from('price_history').insert({
      product_id: product.id,
      price,
      currency,
    });
    console.log('result', result, JSON.stringify(result));

    sendUpdateEmail('akshit07032001@gmail.com', 'New Product Tracked');

    revalidatePath('/');
    return { success: true, product };
  } catch (err) {
    console.error(err);
    return { error: 'Failed to add product' };
  }
}

export async function deleteProduct(productId) {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) throw error;

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
}

export async function getProducts() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Get products error:', error);
    return [];
  }
}

export async function getPriceHistory(productId) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('price_history')
      .select('*')
      .eq('product_id', productId)
      .order('checked_at', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Get price history error:', error);
    return [];
  }
}

// Replace configuration url in Supabase authentication (Site URL) and cron job end point
// add the new end point to .env
