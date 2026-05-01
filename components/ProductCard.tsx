// import { ObjectId } from "mongodb";
// import { User } from "next-auth";
// import Image from "next/image";
import Link from "next/link";
import  { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from "@/context/CartContext";
interface ProductProps {
  id: string;
  name: string;
  price: number;
  image: string;

  category: string;
}
interface User {
 
 
  role: string;
 
}
export default function ProductCard({ id, name, price, image, category }: ProductProps) {
  
   const [user, setUser] = useState<User | null>(null);
   
    const [loading, setLoading] = useState(true);
   
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const { add } = useCart();
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/user/me');
        if (!res.ok) {
          if (res.status === 401) {
            router.push('/login');
            return;
          }
          throw new Error('Failed to fetch user data');
        }
        const data = await res.json();
        setUser(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

function handleAddToCart() {
  add({ id, name, price, image });
}

  return (
    <>
    
    <div className=" group relative flex flex-col  overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md">
      {/* <Link href={`detail/${product.id}`}>hello</Link> */}
    <Link href={`/product/${id}`} className="relative inline-block">
      {/* Product Image */}
      <div className="aspect-square overflow-hidden bg-gray-100">
        
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Product Details */}
      <div className="flex flex-1 flex-col space-y-1 sm:space-y-2 p-3 sm:p-4">
        <span className="text-xs font-medium uppercase tracking-wider text-gray-500">
          {category}
        </span>

        <h3 className="text-sm sm:text-lg font-semibold text-gray-800 line-clamp-2">
            <span aria-hidden="true" className="absolute inset-0" />
            {name}
        </h3>

        <div className="flex items-center justify-between mt-auto">
          <p className="text-lg sm:text-xl font-bold text-gray-900">Rs. {price.toFixed(2)}</p>

        </div>
      </div>
                      </Link>
                
                {user?.role === 'admin' && (
                  <div className="p-3 sm:p-4 border-t border-gray-200">
                  <Link
                    href={`/edit/${id}`}
                    className="block w-full text-center bg-blue-500 text-white px-3 sm:px-4 py-2 rounded-md font-medium hover:bg-blue-600 transition-all text-sm sm:text-base"
                  >
                    Edit
                  </Link>

                </div>
                )}
                  <div className="p-3 sm:p-4 border-t border-gray-200">
                    <button onClick={handleAddToCart} className="block w-full text-center bg-yellow-500 text-white px-3 sm:px-4 py-2 rounded-md font-medium hover:bg-yellow-600 transition-all text-sm sm:text-base">
                      Add to Cart
                    </button>
                  </div>

               
               
    </div>
    </>
  
        
    
          
  );
}