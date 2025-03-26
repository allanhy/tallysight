import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { useRouter } from 'next/navigation';

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthDialog({ isOpen, onClose }: AuthDialogProps) {
  const router = useRouter();

  const handleSignUp = () => {
    router.push('/sign-up');
    onClose();
  };

  const handleSignIn = () => {
    router.push('/sign-in');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            New to TallySight?
          </DialogTitle>
          <p className="text-center text-sm mt-2 text-gray-500 dark:text-gray-400">
            Sign up or Log in to submit your picks!
          </p>
        </DialogHeader>
        <div className="flex flex-col gap-4 mt-4">
          <button
            onClick={handleSignUp}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Sign up
          </button>
          <button
            onClick={handleSignIn}
            className="w-full py-2 px-4 border border-gray-300 text-gray-900 dark:text-gray-100 rounded-md 
                       hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors 
                       dark:border-gray-700"
          >
            Log in
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
