export default function Unauthorized() {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-center">
            <h1 className="text-4xl font-bold text-red-600">403 - Access Denied</h1>
            <p className="text-gray-500 mt-2">You do not have permission to view this page.</p>
            <p className="text-black mt-2">Please login as admin to view this page.</p>
            <a href="/signin" className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                Signin as Admin
            </a>
        </div>
    );
}
