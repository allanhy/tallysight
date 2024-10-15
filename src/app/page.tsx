import { redirect } from 'next/navigation';

export default function HomeRedirect() {
  redirect('/home'); // Redirect to the home page
}