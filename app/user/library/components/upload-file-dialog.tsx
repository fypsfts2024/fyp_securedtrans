import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

const UploadFileDialog = () => {
    return (
        <div>
            <Dialog>
                <DialogTrigger>Upload File</DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Upload File</DialogTitle>
                    </DialogHeader>
                    <div>

                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default UploadFileDialog;